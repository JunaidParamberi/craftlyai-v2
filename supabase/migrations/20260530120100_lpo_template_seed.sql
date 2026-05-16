INSERT INTO public.document_templates (user_id, type, name, description, content_json, is_system)
VALUES (
  null,
  'local_purchase_order',
  'Local Purchase Order',
  'Record a client-issued LPO linked to a project.',
  jsonb_build_object(
    'type', 'doc',
    'content', jsonb_build_array(
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 1),
        'content', jsonb_build_array(
          jsonb_build_object('type', 'text', 'text', 'LPO from {{client_name}}')
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'text', 'text', 'Received by {{brand_business_name}} on {{today}}.')
        )
      ),
      jsonb_build_object(
        'type', 'heading',
        'attrs', jsonb_build_object('level', 2),
        'content', jsonb_build_array(
          jsonb_build_object('type', 'text', 'text', 'Scope')
        )
      ),
      jsonb_build_object(
        'type', 'paragraph',
        'content', jsonb_build_array(
          jsonb_build_object('type', 'text', 'text', 'Describe the authorized work or services here.')
        )
      )
    )
  ),
  true
)
ON CONFLICT DO NOTHING;
