-- Seed 4 system document templates (proposal, quote, invoice, blank).
-- All use {{variable}} placeholders resolved by lib/documents/variables.ts at render time.

insert into public.document_templates
  (user_id, type, name, description, content_json, is_system)
values
  (
    null,
    'proposal',
    'Simple Proposal',
    'Cover page, overview, scope, and investment sections.',
    jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 1),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Project proposal for {{client_name}}')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Prepared by {{brand_business_name}} on {{today}}.')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Overview')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Hi {{client_contact_name}}, thank you for considering us for {{project_title}}. This proposal outlines what we will deliver, how long it will take, and what it will cost.')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Scope of work')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Describe deliverables, milestones, and assumptions here.')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Timeline and investment')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Outline phases, start date, and total fee here.')
          )
        )
      )
    ),
    true
  ),
  (
    null,
    'quote',
    'Basic Quote',
    'Single-page quote with summary and amount.',
    jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 1),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Quote for {{client_name}}')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Issued by {{brand_business_name}} on {{today}}.')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Summary')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Brief description of what is being quoted.')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Total')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Quote valid for 30 days from the date above.')
          )
        )
      )
    ),
    true
  ),
  (
    null,
    'invoice',
    'Standard Invoice',
    'Invoice header with bill-to, line items, and payment notes.',
    jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 1),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Invoice — {{client_name}}')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Date: {{today}}')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Bill to: {{client_company}}')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Line items')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'List each item with quantity, rate, and amount.')
          )
        ),
        jsonb_build_object(
          'type', 'heading',
          'attrs', jsonb_build_object('level', 2),
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Payment')
          )
        ),
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array(
            jsonb_build_object('type', 'text', 'text', 'Please remit payment using the details on file. Thank you for your business.')
          )
        )
      )
    ),
    true
  ),
  (
    null,
    'other',
    'Blank document',
    'Start from a clean canvas.',
    jsonb_build_object(
      'type', 'doc',
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'paragraph',
          'content', jsonb_build_array()
        )
      )
    ),
    true
  );
