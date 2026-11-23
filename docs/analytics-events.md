# GA4 events

Every event the site sends is named **`<page>_<section>_<action>`**, so the GA4
Events report shows where on the site something happened without adding a
dimension. For example, `landing_hero_free_call_click` is the free-call
button in the hero of the landing page.

- **page** comes from the URL (`pageForPath` in `src/app/core/analytics.service.ts`),
  so shared parts such as the navbar report under the page they were used on:
  `landing_navbar_careers_click`, `contact_navbar_careers_click`.
- **section** is the zone of the page. Section views use the same names, so
  `landing_pricing_view` (the visitor reached the pricing section) and
  `landing_pricing_free_call_click` (they clicked its button) line up.
- **action** is what happened: `<button>_click`, `view`, `submit`, …

GA4 drops events whose name is longer than 40 characters, which is why page and
section names are short and there's no `_page` / `_section` suffix. The longest
name below is 38 characters.

Search the GA4 Events table by part of a name to slice it. `landing_` shows the
whole landing page, `navbar` the navbar on every page, `free_call_click` every
free-call button.

## Pages

| `<page>` | URL |
| --- | --- |
| `landing` | `/` (and `/dashboard`) |
| `alex` | `/work-with-alex` |
| `careers` | `/careers` |
| `careers_job` | `/careers/<role>` |
| `contact` | `/contact` |
| `calendar` | `/calendar` |
| `call_confirmed` | `/call-confirmed` |
| `legal` | privacy policy, cookie policy, terms, legal notice, accessibility |
| `not_found` | any other URL (404 page) |

## On every page

| Event | When |
| --- | --- |
| `<page>_navbar_careers_click` | "Careers" link in the navbar. `event_label`: `desktop` or `mobile` menu |
| `<page>_navbar_free_call_click` | Free-call button in the navbar (all pages except the careers pages and `/contact`). `event_label`: `desktop` / `mobile` |
| `<page>_navbar_send_profile_click` | "Send profile" button in the navbar, only on `careers` and `careers_job`. `event_label`: `desktop` / `mobile` |
| `<page>_scroll_25`, `_50`, `_75`, `_90`, `_100` | The visitor scrolled far enough to have seen that share of the page, once per page view. Opening the page doesn't count, scrolling on it does (an #anchor link's scroll included) |

## Landing page (`landing`)

| Event | When |
| --- | --- |
| `landing_<section>_view` | A section scrolled into view: `hero`, `services`, `projects`, `process`, `profiles`, `pricing`, `founder`, `faq`, `lead_magnet`, `final_cta` |
| `landing_hero_free_call_click` | Hero: free-call button |
| `landing_hero_view_profiles_click` | Hero: "see available developers" |
| `landing_hero_trust_badge_click` | Hero: the Top 1 / listafirme.ro badge |
| `landing_services_project_call_click` | Services: call button on the "project" card |
| `landing_services_team_call_click` | Services: call button on the "team" card |
| `landing_services_view_profiles_click` | Services: "see who is available" link |
| `landing_projects_view_cv_click` | Projects: link to Alex's CV |
| `landing_profiles_free_call_click` | Developer profiles: free-call button |
| `landing_pricing_free_call_click` | Pricing: free-call button |
| `landing_founder_view_cv_click` | Founder band: link to Alex's CV |
| `landing_lead_magnet_submit` | Lead magnet: email for the staffing PDF sent to the leads Google Form |
| `landing_lead_magnet_error` | Lead magnet: the email couldn't be sent (offline, blocked by an extension or proxy). The visitor still got the PDF, but the lead is missing from the sheet |
| `landing_lead_magnet_download` | Lead magnet: PDF downloaded. `event_label`: language |
| `landing_final_cta_free_call_click` | Final call to action: free-call button |
| `landing_final_cta_phone_click` | Final call to action: phone number |

## Work with Alex (`alex`)

| Event | When |
| --- | --- |
| `alex_<section>_view` | A section scrolled into view: `hero`, `why_choose_me`, `featured_video`, `testimonials`, `experience`, `experience_end`, `about`, `human_behind`, `human_behind_gallery`, `human_behind_books`, `human_behind_cta`, `skills`, `education` |
| `alex_experience_entry_view` | A role in the experience timeline scrolled into view. `event_label` / `entry_company`: company, `entry_index`: position (1 = oldest) |
| `alex_experience_end_free_call_click` | Free-call button at the end of the experience timeline |
| `alex_testimonials_next_click` / `alex_testimonials_prev_click` | Arrow under the colleagues carousel. `event_label`: the recommendation it moved to (`reportedColleague`, `fullstackColleague`, `angularColleague`, `backendColleague`) |
| `alex_human_behind_photo_view` | A photo shown in the lightbox. `event_label`: photo, `via`: `click` / `next` / `prev` |
| `alex_human_behind_lightbox_close` | Lightbox closed. `photos_viewed`: how many photos were seen |
| `alex_human_behind_cta_free_call_click` | Free-call button in the "human behind the code" closing card |
| `alex_cv_banner_lead_submit` | Email for the CV PDF sent to the leads Google Form from the sticky banner (xl screens) |
| `alex_cv_banner_lead_error` | The banner's email couldn't be sent (offline, blocked). The CV still downloaded, but the lead is missing from the sheet |
| `alex_cv_banner_download` | CV PDF downloaded from the banner. `event_label`: language |
| `alex_cv_bubble_lead_submit` | Email sent to the leads Google Form from the floating CV button's form (below xl) |
| `alex_cv_bubble_lead_error` | The floating button's email couldn't be sent, as for the banner |
| `alex_cv_bubble_download` | CV PDF downloaded from the floating button. `event_label`: language |

## Careers (`careers`)

| Event | When |
| --- | --- |
| `careers_hero_view_roles_click` | Hero: "see open roles" |
| `careers_hero_send_profile_click` | Hero: "send your profile" |
| `careers_openings_search` | Roles filtered by technology. `search_term`, `results_count`, `method`: `typed` / `chip` |
| `careers_openings_apply_click` | "Apply" on a role card. `event_label`: role |
| `careers_openings_send_profile_click` | "Send your profile" shown instead of the list. `event_label`: `error` (roles didn't load), `empty` (no open roles), `no_results` (search found nothing) |
| `careers_final_cta_send_profile_click` | Final call to action: "send your profile" |
| `careers_apply_form_submit` | Application form sent. `event_label`: role (or `general`), `opened_from`: section whose button opened the form |
| `careers_apply_form_error` | Application failed to send (network, blocker); the candidate can retry. Same parameters |

## A role's page (`careers_job`)

| Event | When |
| --- | --- |
| `careers_job_view` | The page showed a role. `event_label`: role |
| `careers_job_header_apply_click` | "Apply" next to the title. `event_label`: role |
| `careers_job_header_share_click` | "Share". `event_label`: role, `method`: `native_share` / `copy_link` |
| `careers_job_apply_banner_apply_click` | "Apply" in the banner under the description. `event_label`: role |
| `careers_job_error_send_profile_click` | "Send your profile" shown when the roles failed to load |
| `careers_job_apply_form_submit` | Application form sent, as on `careers` |
| `careers_job_apply_form_error` | Application failed to send, as on `careers` |

## Contact (`contact`) and calendar (`calendar`)

| Event | When |
| --- | --- |
| `contact_urgent_phone_click` | Phone button in the red "urgent" box |
| `contact_booking_view` | The booking calendar (Google Calendar) scrolled into view |
| `contact_booking_load` | The booking calendar finished loading |
| `contact_booking_engaged` | The visitor clicked into the booking calendar: the strongest booking-intent signal we can see |
| `contact_channels_email_click` | Email card |
| `contact_channels_whatsapp_click` | WhatsApp card |
| `contact_channels_linkedin_click` | LinkedIn card |
| `contact_channels_xing_click` | Xing card |
| `calendar_booking_load` | `/calendar`: the booking calendar finished loading |

## Call confirmed (`call_confirmed`)

| Event | When |
| --- | --- |
| `call_confirmed_research_linkedin_click` | "Research us" section: LinkedIn card |
| `call_confirmed_footer_reschedule_click` | Closing block: "pick another time" (goes to `/contact`) |
| `call_confirmed_footer_email_click` | Closing block: email |
| `call_confirmed_footer_whatsapp_click` | Closing block: WhatsApp |

## Parameters on every event

| Parameter | Value |
| --- | --- |
| `page_name` | The `<page>` part of the name |
| `section_name` | The `<section>` part, when there is one |
| `lead_source`, `lead_medium`, `lead_campaign`, `lead_content` | The visitor's last known marketing channel (`AttributionService`) |

To use a parameter in GA4 reports, register it once under Admin → Custom
definitions → Custom dimensions (event scope). The event names already say
where things happened, so this is only needed to slice further, e.g. by
`event_label`, `section_name` or `opened_from`.

## Not from this code

GA4 adds these by itself, so they keep their generic names: `page_view`,
`session_start`, `first_visit`, `user_engagement`, and the enhanced measurement
events `scroll` (90%), `click` (outbound links) and `form_start` / `form_submit`.
GA4 still records the page path for them.

## Renamed on 2026-11-21

Old name → new name, for updating key events, audiences, explorations and
events created in GA4 Admin.

| Old | New |
| --- | --- |
| `cta_click` | `<page>_<section>_<button>_click`, see the tables above (`event_label` used to hold e.g. `hero_free_call`, `nav_free_call_mobile`) |
| `contact_click` | `contact_urgent_phone_click`, `contact_channels_<channel>_click`, `call_confirmed_research_linkedin_click`, `call_confirmed_footer_<channel>_click` |
| `careers_apply_click` | `careers_openings_apply_click`, `careers_job_header_apply_click`, `careers_job_apply_banner_apply_click`, or the `…_send_profile_click` of the button used. It used to fire alongside `cta_click` for the same click; now each click sends one event |
| `careers_view_details_click` | `careers_job_view` (it always fired on page view, not on a click) |
| `careers_share_click` | `careers_job_header_share_click` |
| `careers_search` | `careers_openings_search` |
| `careers_application_submit` | `careers_apply_form_submit`, `careers_job_apply_form_submit` |
| `careers_application_error` | `careers_apply_form_error`, `careers_job_apply_form_error` |
| `calendar_section_viewed` | `contact_booking_view` |
| `calendar_engaged` | `contact_booking_engaged` |
| `calendar_iframe_loaded` | `contact_booking_load`, `calendar_booking_load` |
| `lead_magnet_submit` | `landing_lead_magnet_submit` |
| `lead_magnet_download` | `landing_lead_magnet_download` |
| `cv_lead_submit` | `alex_cv_banner_lead_submit`, `alex_cv_bubble_lead_submit` |
| `cv_download` | `alex_cv_banner_download`, `alex_cv_bubble_download` |
| `scroll_depth` | `<page>_scroll_25` … `<page>_scroll_100` |
| `section_view` | `<page>_<section>_view` |
| `experience_entry_view` | `alex_experience_entry_view` |
| `photo_view` | `alex_human_behind_photo_view` |
| `photo_lightbox_close` | `alex_human_behind_lightbox_close` |

The `event_category` parameter is no longer sent; `page_name` and
`section_name` replace it.

## Counting fixed on 2026-11-21

Expect these to drop after this deploy; the old numbers were inflated.

- A page opened from a link further down the previous page used to show up at
  that scroll position and then slide up to its top. On the way it sent every
  scroll milestone at once and section views (and `alex_experience_entry_view`)
  for parts the visitor never reached. New pages now open at their top
  (`App`), and the scroll tracker ignores that jump.
- `contact_booking_load` (then `calendar_iframe_loaded`) counted twice per
  visit: once for the iframe's empty initial document, once for the calendar.
  Only the calendar counts now.
