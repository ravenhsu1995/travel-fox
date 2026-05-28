update days
set timeline = (
  select coalesce(
    jsonb_agg(
      case
        when elem->>'type' = 'exp' then
          (elem - 'type' - 'exp')
            || jsonb_build_object('type', 'spot')
            || jsonb_build_object(
              'spot',
              (coalesce(elem->'exp', '{}'::jsonb) - 'spot')
                || jsonb_build_object('name', elem->'exp'->>'spot')
            )
        else elem
      end
      order by ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(timeline) with ordinality as t(elem, ord)
)
where timeline::text like '%"type": "exp"%';

update expenses
set category = '✨ 景點'
where category = '✨ 體驗';
