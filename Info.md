Connect to database: docker exec -it recipe-db psql -U myuser -d recipedb

Schema:
                               Table "public.recipes"
   Column    |  Type   | Collation | Nullable |               Default
-------------+---------+-----------+----------+-------------------------------------
 id          | integer |           | not null | nextval('recipes_id_seq'::regclass)
 title       | text    |           | not null |
 difficulty  | text    |           |          |
 ingredients | text[]  |           |          |
 image_url   | text    |           |          |
 pasta_type  | text    |           |          |
 recipe_url  | text    |           |          |


Launch http://localhost/docs to get interactive API mode