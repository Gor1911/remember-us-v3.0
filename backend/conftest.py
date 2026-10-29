"""Pytest configuration — shared fixtures."""
from __future__ import annotations

import pytest
from django.core.cache import cache

# Settings are loaded via pytest.ini DJANGO_SETTINGS_MODULE


@pytest.fixture(autouse=True)
def clear_cache():
    """Reset the cache (DRF throttle counters) around every test."""
    cache.clear()
    yield
    cache.clear()
