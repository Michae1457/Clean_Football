# supabase

Migrations live in `supabase/migrations`.

Current data phases:

- `202607090001_initial_schema.sql`: core tables, RLS read policies, default RSS sources.
- `202607090002_add_verified_news_sources.sql`: additional verified RSS sources.
- `202607090003_add_world_cup_and_top_league_sources.sql`: World Cup and top league RSS routes.
- `202607090004_add_sportsdb_match_source.sql`: TheSportsDB API source and default followed leagues for Phase 4/5.
