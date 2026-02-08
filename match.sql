create or replace function match_movies (
  query_embedding vector(3072),
  match_threshold float8, 
  match_count int
)
returns table (
  id bigint,
  title text,
  "releaseYear" bigint, 
  similarity float8
)
language sql stable
as $$
  select
    movies.id,
    movies.title,
    movies."releaseYear", 
    1 - (movies.embedding <=> query_embedding) as similarity
  from movies
  where 1 - (movies.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;