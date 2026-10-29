"""User model with role system: Owner → Admin/Curator → Guest."""
from __future__ import annotations

import uuid

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models, transaction
from django.utils import timezone


class UserRole(models.TextChoices):
    """Access levels for memorial pages."""

    OWNER = "owner", "Owner"
    ADMIN = "admin", "Admin"
    CURATOR = "curator", "Curator"
    GUEST = "guest", "Guest"


class UserManager(BaseUserManager):
    """Custom user manager without username."""

    def create_user(
        self,
        email: str,
        password: str | None = None,
        **extra_fields,
    ) -> User:
        """Create and return a regular user."""
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email: str, password: str, **extra_fields) -> User:
        """Create and return a superuser."""
        extra_fields.setdefault("role", UserRole.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """User with UUID PK and role-based access."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.GUEST,
        db_index=True,
    )

    # Profile
    display_name = models.CharField(max_length=150, blank=True)

    # Flags
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    # Legal consent
    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    terms_version = models.CharField(max_length=50, blank=True)

    # Timestamps
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login = models.DateTimeField(null=True, blank=True)

    # Digital heir: who inherits this account's pages
    digital_heir = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="inherited_from",
    )

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.email} ({self.role})"

    # --- Role helpers ---

    @property
    def is_owner(self) -> bool:
        """Check if user has Owner role."""
        return self.role == UserRole.OWNER

    @property
    def is_admin(self) -> bool:
        """Check if user has Admin role."""
        return self.role == UserRole.ADMIN

    @property
    def is_curator(self) -> bool:
        """Check if user has Curator role."""
        return self.role == UserRole.CURATOR

    @property
    def is_guest(self) -> bool:
        """Check if user has Guest (read-only) role."""
        return self.role == UserRole.GUEST

    @property
    def can_edit(self) -> bool:
        """Check if user can create or edit memorial content."""
        return self.role in [UserRole.OWNER, UserRole.ADMIN, UserRole.CURATOR]

    @property
    def can_approve(self) -> bool:
        """Check if user can move pages to ACTIVE state."""
        return self.role == UserRole.ADMIN

    def transfer_heir_rights(self, new_heir: User) -> None:
        """Transfer digital heir designation."""
        self.digital_heir = new_heir
        self.save(update_fields=["digital_heir", "updated_at"])

    def record_login(self) -> None:
        """Update last_login timestamp."""
        self.last_login = timezone.now()
        self.save(update_fields=["last_login"])

    def is_last_active_admin(self) -> bool:
        """Return True if this user is the only active, non-deleted admin."""
        if self.role != UserRole.ADMIN:
            return False
        return not (
            User.objects.filter(role=UserRole.ADMIN, is_active=True, is_deleted=False)
            .exclude(pk=self.pk)
            .exists()
        )

    def delete_account(self) -> None:
        """Soft-delete the account: remove owned pages/media and anonymize personal data."""
        now = timezone.now()
        with transaction.atomic():
            for page in self.owned_pages.all():
                for media in page.media_files.all():
                    media.soft_delete()
                page.soft_delete()
            self.email = f"deleted-{self.id}@deleted.invalid"
            self.display_name = ""
            self.set_unusable_password()
            self.is_active = False
            self.is_deleted = True
            self.deleted_at = now
            self.save()
