"""
supabase_client.py — Supabase connection singleton.

Uses the service role key so the backend can bypass RLS for writes.
Never use the anon key on the backend.
"""

from functools import lru_cache

from supabase import create_client, Client

from app.config import settings


@lru_cache()
def get_supabase() -> Client:
    """Return a cached Supabase client. Thread-safe after first call."""
    return create_client(
        supabase_url=settings.supabase_url,
        supabase_key=settings.supabase_service_key,
    )
