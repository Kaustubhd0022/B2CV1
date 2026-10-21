I’m consolidating this into one TattvaCo B2C Cultural Discovery Engine — Final Master Product & Prototype Specification. It brings together the CEO’s strategic brief, the existing PRD, information architecture, screen-by-screen wireframe structure, visual design system, government-source strategy, open-ended secondary research, curiosity-led discovery, and the implementation requirements needed to build a working prototype.

The strategic brief remains the product vision. This master specification translates it into a buildable experience, adding missing implementation details while distinguishing confirmed decisions from recommended defaults and dependencies.

# TattvaCo — B2C Cultural Discovery Engine

# Final Master Product & Prototype Specification

Version 1.0 · 21 October 2026

Product Requirements

Information Architecture

UI/UX & Design System

Wireframes

AI & Knowledge Architecture

Prototype QA

Product vision: Help people discover not just India's cultural stories, but the relationships, context and living meaning behind them.

Core journey: Discover → Explore → Understand → Connect → Experience → Discover Further.

Delivery goal: A genuinely interactive, mobile-first web prototype that demonstrates the complete core journey using source-grounded cultural content, meaningful connections, multilingual interaction, maps and rights-aware visual media.

## How to interpret this specification

- CONFIRMED: A decision already established in the product brief or subsequent product decisions.
- RECOMMENDED: A practical implementation choice proposed to make the prototype buildable.
- DEPENDENCY: Requires credentials, access, approved content, permissions or an external service.
- NOT YET VERIFIED: Must not be presented as working until tested in the running prototype.

The prototype can demonstrate a complete product experience without pretending every external integration, source collection or language has already been connected and validated.

# 1. Product vision, strategic baseline and scope

## 1.1 Vision

TattvaCo is an AI-native cultural discovery experience that makes India's cultural knowledge easier to discover, understand, contextualise and explore through meaningful relationships.

It should not be another tourism portal, a static content library, a generic chatbot or a collection of disconnected AI answers.

Its differentiation is the ability to bring together:

- Cultural knowledge from diverse sources.
- Evidence-backed explanations with historical, geographic and social context.
- Meaningful connections between cultural entities.
- Living traditions and contemporary communities.
- Open-ended research with traceable sources.
- A natural interface that invites further discovery.

## 1.2 Product outcome

The primary outcome is meaningful cultural discovery.

A successful user journey should help a person:

1. Find a topic that sparks curiosity.
2. Understand its context and significance.
3. Explore a meaningful connection.
4. Inspect evidence when desired.
5. Continue to another relevant discovery.
6. Find the experience useful and trustworthy enough to return.

Engagement alone is not success. A long session filled with weak, repetitive or unsupported information is not a successful discovery experience.

## 1.3 Target users

| Audience                               | Core need                                      | Product response                                              |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Culturally curious explorers           | Discover beyond familiar facts                 | Guided browsing and unexpected, meaningful connections        |
| Indian travellers                      | Understand the cultural significance of places | Place-based stories, maps and related themes                  |
| International audiences and Indophiles | Understand unfamiliar concepts and context     | Clear explanations, multilingual content and cultural context |
| Students and lifelong learners         | Learn how events, traditions and ideas connect | Structured stories, timelines, explanations and references    |
| Heritage and culture enthusiasts       | Explore deeper and compare perspectives        | Source-supported research and interconnected subjects         |

Primary MVP audience: Culturally curious explorers.

The other audiences are served through the same core product, rather than by building separate products or modes before the primary experience is validated.

## 1.4 Product boundaries

### In Phase 1

- Standalone B2C responsive web app.
- Account access and language selection.
- Browse, search and ask.
- Six curated pilot-city collections.
- Approximately 18–24 approved flagship stories.
- AI answers supported by external research.
- Meaningful, evidence-backed cultural connections.
- Consolidated evidence and source details.
- Google Maps integration where configured.
- Rights-aware photos and visual media.
- Full core-journey language support across the 11 selected languages.
- Reporting, feedback, quality checks and prototype evaluation.
  ### Not part of Phase 1 by default
- Hotel, flight, ticket or guide bookings.
- Commercial marketplace and payments.
- Persistent personal profiles or long-term AI memory.
- Saved libraries and permanent discovery trails.
- Social feeds or community publishing.
- Native mobile applications.
- Autonomous publication of editorial flagship stories.
- Dependence on the internal storytelling engine.

Maps may help users understand the geography of a cultural subject, but their inclusion does not automatically authorise travel planning, live location tracking or booking functionality.

## 1.5 Standalone now, compatible with a future shared framework

The strategic brief describes a long-term Cultural Knowledge Framework that can support multiple TattvaCo applications. The B2C product must nevertheless operate independently for the present release.

Implementation decision: Build a B2C-owned source registry, ingestion pipeline, knowledge model, retrieval system and editorial workflow. Use interoperable identifiers and documented schemas where practical, so that a future shared framework can be adopted without making it a current dependency.

# 2. Core experience: curiosity-led exploration

This is the most important behavioural requirement in the entire specification.

## 2.1 Discovery grammar

A question should open a path, not merely produce an answer.

Users may begin with:

- A place or monument.
- A person, dynasty or historical event.
- A festival, food, craft or art form.
- A tradition, philosophy or belief.
- A community or language.
- An image, object or artefact.
- An open-ended question.

The system should identify relevant relationships and offer useful next directions without overwhelming the user.

## 2.2 Example discovery journey

## Varanasi

Starting point: a place

Ganga

River, ecology, ritual and sacred geography

Kashi and Shiva

Religious traditions and sacred geography

Pilgrimage, death and moksha

Belief, philosophy and practice

Ghats and music

Public spaces, performance and living traditions

Banarasi silk

Craft, materials, artisans and livelihoods

Contemporary Varanasi

People, food, festivals and change

Illustrative pathways from the CEO's brief. Each relationship must be researched, explained and supported before being represented as a factual connection.

## 2.3 Required interaction rules

1. Every eligible story and substantive AI answer should offer relevant next discoveries.
2. A connection card must explain why these subjects are connected.
3. Users can move from a place to a tradition, from a tradition to a person, and from a person to a historical or contemporary context.
4. Users can ask follow-up questions within the current session.
5. Users can branch into a new topic without restarting the entire experience.
6. The system can suggest historical, geographic, artistic, social, philosophical and contemporary perspectives where relevant.
7. Users can go back to the previous discovery and retain the current session's navigation context.
8. Discovery should remain optional: no forced recommendation carousel after every short answer.
9. Connections must not be generated solely because two terms frequently appear together.
10. Speculative or interpretive relationships must be labelled appropriately.

## 2.4 Connection model

Every connection should have the following fields:

| Field               | Purpose                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| Source entity       | Where the user is starting                                                       |
| Target entity       | What the user can explore next                                                   |
| Relationship type   | Historical, geographic, cultural, artistic, philosophical, social, etc.          |
| Rationale           | A concise explanation of why the connection matters                              |
| Supporting evidence | Relevant source references or claim evidence                                     |
| Evidence status     | Documented, tradition/belief, interpretation, contested or insufficient evidence |
| Confidence          | Internal evidence assessment, not an unsupported numeric score                   |
| Editorial status    | Draft, reviewed, approved or rejected                                            |
| Language            | Language-specific rationale and display content                                  |
| Version             | Allows corrections and updates                                                   |

A connection that lacks adequate evidence should not be published as an established fact. The AI can propose candidate connections, but runtime checks and editorial review must govern what is shown.

# 3. Information architecture (IA)

## 3.1 Global navigation

Recommended mobile navigation

- Discover
- Explore
- Ask
- Language and account menu

Keep the navigation compact. Ask may be a prominent entry point rather than a separate screen that isolates the user from discovery.

Recommended desktop navigation

- TattvaCo wordmark
- Discover
- Explore
- Ask TattvaCo
- Language selector
- Account menu

The primary navigation should remain consistent throughout browsing, story reading, source inspection and connection exploration.

## 3.2 Sitemap

\#chatgpt-mermaid-\_r_2g5\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_2g5\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2g5\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2g5\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_2g5\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_2g5\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_2g5\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_2g5\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_2g5\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_2g5\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2g5\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2g5\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_2g5\_ p{margin:0;}#chatgpt-mermaid-\_r_2g5\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_2g5\_ .label text,#chatgpt-mermaid-\_r_2g5\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ .node rect,#chatgpt-mermaid-\_r_2g5\_ .node circle,#chatgpt-mermaid-\_r_2g5\_ .node ellipse,#chatgpt-mermaid-\_r_2g5\_ .node polygon,#chatgpt-mermaid-\_r_2g5\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .rough-node .label text,#chatgpt-mermaid-\_r_2g5\_ .node .label text,#chatgpt-mermaid-\_r_2g5\_ .image-shape .label,#chatgpt-mermaid-\_r_2g5\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_2g5\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .rough-node .label,#chatgpt-mermaid-\_r_2g5\_ .node .label,#chatgpt-mermaid-\_r_2g5\_ .image-shape .label,#chatgpt-mermaid-\_r_2g5\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_2g5\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_2g5\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2g5\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2g5\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_2g5\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2g5\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2g5\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2g5\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_2g5\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_2g5\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2g5\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_2g5\_ .icon-shape,#chatgpt-mermaid-\_r_2g5\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2g5\_ .icon-shape p,#chatgpt-mermaid-\_r_2g5\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_2g5\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_2g5\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2g5\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_2g5\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_2g5\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_2g5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_2g5\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_2g5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_2g5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2g5\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_2g5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2g5\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2g5\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2g5\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_2g5\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_2g5\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .node rect,#chatgpt-mermaid-\_r_2g5\_ .node circle,#chatgpt-mermaid-\_r_2g5\_ .node ellipse,#chatgpt-mermaid-\_r_2g5\_ .node polygon,#chatgpt-mermaid-\_r_2g5\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2g5\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_2g5\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_2g5\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_2g5\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2g5\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Welcome / AuthenticationLanguage SelectionDiscover HomeBrowse by ThemeCity CollectionsSearchAsk TattvaCoFeatured StoriesCollection / Theme DetailCity OverviewFlagship StoryAI AnswerEvidence PanelRelated ConnectionsFollow-up QuestionConnection DetailShare StorySettingsLanguagePrivacy / AccountReport IssueExternal Original Source

The map shows logical relationships, not a requirement to create a separate URL for every state. Some details can be drawers, modals or expandable panels where that improves usability.

## 3.3 Content hierarchy

Use a shared content taxonomy:

- Geography: country, state, region, city, landscape, river, site.
- People: historical figures, practitioners, artists, communities, dynasties.
- History: event, period, chronology, archaeological evidence, historical record.
- Belief and philosophy: traditions, concepts, schools of thought, practices.
- Living culture: festivals, rituals, music, dance, food, crafts, languages.
- Objects and collections: artefacts, monuments, manuscripts, artworks, museum collections.
- Experience and context: cultural significance, social change, place relationships and contemporary life.

Each entity can belong to multiple categories. The taxonomy must support regional terms, alternate names, transliterations and culturally meaningful original-language terms.

## 3.4 URL and state strategy

Recommended implementation

- Use stable, shareable URLs for published stories and approved connection pages.
- Keep user-specific conversation history and account data out of shareable URLs.
- Use session state for the active question thread and navigation context.
- Support browser back/forward navigation.
- Preserve the intended destination through sign-in when appropriate.
- Handle unavailable, unpublished or removed content with a clear status instead of silently redirecting to unrelated content.

Whether shared public links should be accessible before sign-in remains an explicit product-owner decision. Do not accidentally expose private AI conversations while implementing public story sharing.

# 4. Product requirements document (PRD)

## 4.1 Functional requirements

Priorities below are recommended build priorities unless otherwise stated by the existing baseline.

| ID    | Requirement               | Priority                                      | Acceptance criteria                                                                                |
| ----- | ------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| FR-01 | Authentication            | P0                                            | Required account access; supported email, phone, Google and Apple flows; recovery and error states |
| FR-02 | Language selection        | P0                                            | User can select and change language; scripts, fonts and layouts remain usable                      |
| FR-03 | Discover home             | P0                                            | Offers browse entry points, featured stories, city collections and an Ask entry point              |
| FR-04 | Six city collections      | P0                                            | Varanasi, Jaipur, Hampi, Kochi, Kolkata and Madurai have usable collection pages                   |
| FR-05 | Flagship stories          | P0                                            | Target 18–24 total, approximately 3–4 per city, all editorially approved before public publication |
| FR-06 | Cultural search           | P0                                            | Search supports relevant names, alternate spellings and supported languages                        |
| FR-07 | AI Q&A                    | P0                                            | Answers are generated using external retrieval, source evidence and uncertainty handling           |
| FR-08 | Discovery connections     | P0                                            | Related entities have a meaningful rationale and adequate evidence                                 |
| FR-09 | Evidence panel            | P0                                            | Sources are consolidated and inspectable without repetitive inline links                           |
| FR-10 | Session continuity        | P0                                            | Follow-up questions and branches retain appropriate in-session context                             |
| FR-11 | Share stories/connections | P0                                            | Published items can be shared without exposing private session data                                |
| FR-12 | Report an issue           | P0                                            | User can flag incorrect, insensitive, broken or unsupported content                                |
| FR-13 | Google Maps               | P0 for requested demo, subject to credentials | Relevant map or place view works when API access is configured; clear fallback otherwise           |
| FR-14 | Visual media              | P0                                            | Image provenance, usage permission, attribution and alt text are managed                           |
| FR-15 | 11-language core journey  | P0 commitment; release-gated                  | Interface, content, answers, sources and discovery flows pass language-specific quality checks     |
| FR-16 | Settings and privacy      | P0                                            | Account/session and privacy controls are accessible and functional                                 |
| FR-17 | Editorial governance      | P0 for flagship content                       | Draft, review, approval, correction and versioning workflow exists                                 |
| FR-18 | Analytics and evaluation  | P0                                            | Discovery, evidence use, continuation, errors and trust signals can be measured responsibly        |

## 4.2 Story content specification

Each flagship story must contain:

1. Title and short orientation.
2. Hero image or other suitable media, where rights and quality allow.
3. Context: what, where, when and who, where supported.
4. A readable narrative explaining significance.
5. Historical, geographic, social, artistic or philosophical context as relevant.
6. Distinction between documented evidence, tradition/belief and interpretation.
7. Relevant regional variations and credible disagreements.
8. A consolidated evidence section with original source links.
9. A small number of meaningful, verified connections.
10. Related questions or next discoveries.
11. Language metadata and alternate names.
12. Editorial status, content version and a report/correction route.

Avoid filling every template field mechanically. Show only relevant sections, and do not invent dates, quotations, origin stories or community practices to make a story appear complete.

## 4.3 AI answer requirements

An AI answer must:

- Identify the user's intent and relevant cultural entities.
- Retrieve appropriate evidence before asserting material facts.
- Use official government sources where relevant and available.
- Conduct open-ended secondary research when necessary.
- Preserve citations and claim-level provenance internally.
- Distinguish evidence, tradition/belief and interpretation.
- Acknowledge meaningful disagreements.
- State limitations where evidence is insufficient.
- Offer a few relevant follow-on discoveries.
- Keep source references visually consolidated.

For insufficient evidence, the system should narrow the answer, explain what is not known or decline to assert a claim. It must not invent citations or claim that it verified a source when it only received generated text.

## 4.4 AI answer and story distinction

The UI must make it clear whether a user is reading:

- Published story: Editorially approved and versioned.
- AI answer: Generated for the current question using retrieved evidence.
- Connection suggestion: A supported pathway to another subject.
- Source record: Original or secondary reference material.

AI-generated responses must not inherit the editorial approval status of a nearby flagship story.

# 5. Source strategy and cultural knowledge ingestion

## 5.1 Government-first source registry

The source list supplied earlier is the initial candidate registry. It includes national government portals, cultural repositories, archives, academies, museums, educational sources, state culture departments and tourism portals.&#x20;

Pasted text(6).txt



Initial source families to register:

- Ministry of Culture and relevant national government directories.
- Indian Culture Portal.
- National Mission on Cultural Mapping / Mera Gaon Meri Dharohar.
- Vedic Heritage Portal.
- Archaeological Survey of India.
- National Archives of India and Abhilekh Patal.
- Sangeet Natak Akademi, Sahitya Akademi and Lalit Kala Akademi.
- Centre for Cultural Resources and Training.
- Museums of India, National Museum and National Gallery of Modern Art.
- NCERT and relevant education resources.
- Indian Council for Cultural Relations.
- Ministry of Tourism / Incredible India.
- Relevant state culture, archaeology and tourism departments.
- Other official repositories identified in the supplied registry.

This is the starting list, not proof that all sources have been ingested or that every listed portal supports automated access.

## 5.2 Open secondary research

Government sources are the first research priority, not an exclusive boundary.

The research system must be able to use:

- Peer-reviewed research and scholarly books.
- University and specialist research repositories.
- Credible museum and cultural institution publications.
- Specialist historical, archaeological and cultural publications.
- Reputable journalism for contemporary developments and documented reporting.
- Relevant community and practitioner sources for living culture, where use is appropriate and permitted.

Source suitability depends on the claim. An official portal may establish an official designation; academic work may be better suited to historical interpretation; a practitioner or community source may be essential for understanding a living practice.

## 5.3 Source registry schema

Every registered source should record:

| Field                    | Required purpose                                                |
| ------------------------ | --------------------------------------------------------------- |
| Source ID                | Stable internal identifier                                      |
| Name and publisher       | Identifies the origin                                           |
| Canonical URL            | Original source destination                                     |
| Source type              | Government, archive, academic, museum, community, etc.          |
| Jurisdiction / geography | Country, state, region or locality                              |
| Languages                | Original and supported languages                                |
| Access method            | API, open dataset, download, permitted crawl or manual research |
| Licence / usage terms    | Permitted indexing, storage, display and reuse                  |
| Retrieval date           | When the material was obtained                                  |
| Publication/update date  | If available                                                    |
| Content hash / version   | Change detection                                                |
| Status                   | Active, temporarily unavailable, restricted or retired          |
| Quality notes            | Limitations, known gaps and review requirements                 |

## 5.4 Ingestion pipeline

\#chatgpt-mermaid-\_r_2gg\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_2gg\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2gg\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2gg\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_2gg\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_2gg\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_2gg\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_2gg\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_2gg\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_2gg\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2gg\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2gg\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_2gg\_ p{margin:0;}#chatgpt-mermaid-\_r_2gg\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_2gg\_ .label text,#chatgpt-mermaid-\_r_2gg\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ .node rect,#chatgpt-mermaid-\_r_2gg\_ .node circle,#chatgpt-mermaid-\_r_2gg\_ .node ellipse,#chatgpt-mermaid-\_r_2gg\_ .node polygon,#chatgpt-mermaid-\_r_2gg\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .rough-node .label text,#chatgpt-mermaid-\_r_2gg\_ .node .label text,#chatgpt-mermaid-\_r_2gg\_ .image-shape .label,#chatgpt-mermaid-\_r_2gg\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_2gg\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .rough-node .label,#chatgpt-mermaid-\_r_2gg\_ .node .label,#chatgpt-mermaid-\_r_2gg\_ .image-shape .label,#chatgpt-mermaid-\_r_2gg\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_2gg\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_2gg\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2gg\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2gg\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_2gg\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2gg\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2gg\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2gg\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_2gg\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_2gg\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2gg\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_2gg\_ .icon-shape,#chatgpt-mermaid-\_r_2gg\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2gg\_ .icon-shape p,#chatgpt-mermaid-\_r_2gg\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_2gg\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_2gg\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2gg\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_2gg\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_2gg\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_2gg\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_2gg\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_2gg\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_2gg\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2gg\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_2gg\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2gg\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2gg\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2gg\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_2gg\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_2gg\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .node rect,#chatgpt-mermaid-\_r_2gg\_ .node circle,#chatgpt-mermaid-\_r_2gg\_ .node ellipse,#chatgpt-mermaid-\_r_2gg\_ .node polygon,#chatgpt-mermaid-\_r_2gg\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2gg\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_2gg\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_2gg\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_2gg\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2gg\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Approved Source RegistrySource Access / IngestionExtract Text, Metadata andMedia ReferencesNormalise and DeduplicateLicence, Quality andLanguage ChecksStore Original andProvenanceChunk and Index ContentEntity and RelationshipExtractionClaim and Evidence LinkingEditorial Review whereRequiredSearch / Retrieval /Knowledge GraphAI Answer and DiscoveryConnectionsRuntime Validation and UIFeedback, Correction andRe-indexing

### Ingestion requirements

- Prefer official APIs and open datasets where available.
- Use automated crawling only where permitted by the site's terms and technical policies.
- Do not bypass access controls, CAPTCHAs, authentication or technical restrictions.
- Preserve source attribution and original links.
- Deduplicate copies of the same document.
- Detect broken or changed sources.
- Store extracted content with source and version metadata.
- Record ingestion failures rather than silently skipping sources.
- Separate source discovery from approval to publish claims.
- Do not use restricted or sensitive knowledge without an appropriate basis and review.
- Respect copyright, licence conditions and cultural restrictions.

## 5.5 Research retrieval and source selection

For each question:

1. Parse intent, entities, language and any relevant temporal context.
2. Search the internal index of approved and ingested material.
3. Retrieve relevant passages and their provenance.
4. Identify gaps, conflicting accounts and weak evidence.
5. Conduct external research where needed and technically available.
6. Compare sources against the specific claim, not just the source's overall reputation.
7. Generate a contextualised answer.
8. Validate claim support, citations, sensitivity and uncertainty.
9. Render a clean answer with consolidated references and next discoveries.

If external web research is unavailable in a deployment, the system must say that its answer is based on the indexed corpus rather than implying it performed live research.

## 5.6 Evidence model

Use separate fields for:

- Claim: What the answer asserts.
- Evidence passage: The source text supporting or challenging the claim.
- Source: Where that passage originated.
- Claim type: Documented fact, traditional account, belief, interpretation, contemporary report or disputed claim.
- Support relationship: Supports, qualifies, contradicts or contextualises.
- Review status: Automated checks, editorial review or unresolved.
- Confidence assessment: Based on the evidence available, with limitations recorded.

A source's institutional status does not automatically establish the truth of every claim it contains.

# 6. Source-display UX: provenance without clutter

The interface must not repeat “View this source” after every line. Evidence should remain accessible, but reading should feel natural.

## 6.1 Required UI pattern

## Why is Varanasi known as Kashi?

Varanasi is also known as Kashi in religious and cultural traditions. Its identity is connected to sacred geography, pilgrimage, literature and contemporary life.

Understanding these relationships requires attention to different historical periods and traditions. Not every religious account should be treated as a claim of independently established historical fact.

Historical context

Tradition and belief

Evidence & further readingOfficial sources · Scholarly research · Relevant cultural material

### Where would you like to explore next?

Ganga and sacred geography

Kashi and Shiva

Ghats and pilgrimage

Music and living traditions

Illustrative interaction design, not a fact-checked cultural answer.

The interaction above demonstrates the intended layout. In the working application, the evidence control opens a source drawer, expandable panel or dedicated source-detail page.

## 6.2 Display rules

- Consolidate source links at the end of an answer or relevant content section.
- For long stories, group sources by section or topic.
- Show a subtle inline attribution only where it materially improves clarity.
- Put uncertainty near the affected claim rather than hiding it in a footer.
- Display source title, publisher, source type and date where available.
- Provide a direct link to the original source.
- Preserve the user's reading position when opening and closing the evidence panel.
- Avoid fake source counts, invented publication dates or decorative trust badges unsupported by evidence.

# 7. AI architecture and runtime behaviour

## 7.1 Recommended logical architecture

\#chatgpt-mermaid-\_r_2h5\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_2h5\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2h5\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2h5\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_2h5\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_2h5\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_2h5\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_2h5\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_2h5\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_2h5\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2h5\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2h5\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_2h5\_ p{margin:0;}#chatgpt-mermaid-\_r_2h5\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_2h5\_ .label text,#chatgpt-mermaid-\_r_2h5\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ .node rect,#chatgpt-mermaid-\_r_2h5\_ .node circle,#chatgpt-mermaid-\_r_2h5\_ .node ellipse,#chatgpt-mermaid-\_r_2h5\_ .node polygon,#chatgpt-mermaid-\_r_2h5\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .rough-node .label text,#chatgpt-mermaid-\_r_2h5\_ .node .label text,#chatgpt-mermaid-\_r_2h5\_ .image-shape .label,#chatgpt-mermaid-\_r_2h5\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_2h5\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .rough-node .label,#chatgpt-mermaid-\_r_2h5\_ .node .label,#chatgpt-mermaid-\_r_2h5\_ .image-shape .label,#chatgpt-mermaid-\_r_2h5\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_2h5\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_2h5\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2h5\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2h5\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_2h5\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2h5\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2h5\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2h5\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_2h5\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_2h5\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2h5\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_2h5\_ .icon-shape,#chatgpt-mermaid-\_r_2h5\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2h5\_ .icon-shape p,#chatgpt-mermaid-\_r_2h5\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_2h5\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_2h5\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2h5\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_2h5\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_2h5\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_2h5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_2h5\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_2h5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_2h5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2h5\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_2h5\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2h5\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2h5\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2h5\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_2h5\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_2h5\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .node rect,#chatgpt-mermaid-\_r_2h5\_ .node circle,#chatgpt-mermaid-\_r_2h5\_ .node ellipse,#chatgpt-mermaid-\_r_2h5\_ .node polygon,#chatgpt-mermaid-\_r_2h5\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2h5\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_2h5\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_2h5\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_2h5\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2h5\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Responsive Web UIApplication APISession and AuthDiscovery OrchestratorIntent and Entity ResolverResearch and RetrievalKnowledge and ConnectionServiceLanguage ServiceSource RegistryDocument / Text IndexExternal ResearchConnectorsEntities and RelationshipsClaim and Evidence StoreProvenance and RightsChecksConnection ValidationClaim Support and ConflictChecksAnswer ComposerRuntime Policy GateAnswer + Evidence + NextDiscoveries

The architecture describes logical capabilities, not a requirement to deploy a separate microservice or AI agent for each box.

## 7.2 Recommended agent behaviours

| Capability             | Responsibility                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| Discovery              | Understand what the user wants to explore                        |
| Research               | Find relevant evidence and source passages                       |
| Verification           | Assess provenance, support, recency and conflicts                |
| Knowledge              | Resolve entities and structure relationships                     |
| Context                | Explain cultural, historical, geographic and social significance |
| Connection             | Recommend meaningful next discoveries                            |
| Language               | Preserve meaning across supported languages                      |
| Orchestration          | Decide what information and next actions belong in the response  |
| Safety and sensitivity | Flag sensitive, contested, restricted or low-confidence material |

These may be implemented as orchestrated functions or a smaller number of agents. Separate agents are not mandatory for the prototype.

## 7.3 Runtime answer states

Every answer should resolve to a defined state:

- Supported: Evidence meets the applicable checks.
- Qualified: Evidence supports a limited or contextualised answer.
- Contested: Credible sources or traditions differ meaningfully.
- Insufficient evidence: The system cannot responsibly establish the requested claim.
- Source unavailable: Required material cannot currently be retrieved.
- Restricted: The material should not be disclosed or interpreted in the requested manner.
- Technical failure: The research or generation operation failed.

The UI must distinguish a successful qualified answer from a technical error.

## 7.4 Governance

- Every flagship story requires editorial approval.
- AI-proposed connections must be checked before being treated as established relationships.
- Routine AI answers may be auto-approved only after all required checks pass.
- Missing, indeterminate or failed checks must block automatic approval.
- Sensitive and contested subjects require stricter review or qualified responses.
- Preserve an audit trail for corrections and editorial decisions.
- No autonomous publication of flagship stories.
- Do not treat a generated answer as verified simply because it includes a citation.

# 8. Google Maps and place intelligence

Google Maps is a requested prototype capability, subject to valid credentials and enabled services.

## 8.1 Place experience

The place interface should support:

- City and region overview.
- Relevant heritage or cultural place details.
- Map visualisation and place markers.
- Place-related stories and connections.
- Official or credible source references for place information.
- External directions links where supported.
- Clear distinction between cultural interpretation and practical visitor information.

## 8.2 Maps integration requirements

Recommended integration: Use Google Maps Platform with a server-safe configuration, API restrictions and the appropriate services enabled for the chosen implementation.

The exact services depend on whether the prototype needs an interactive map, geocoding, place details or directions. Do not enable unnecessary APIs.

Implementation must include:

- Valid API credentials and appropriate billing configuration.
- Website/application restrictions for client keys.
- Server-side storage for any server-only secrets.
- Usage monitoring and quota limits.
- Google Maps Platform terms and attribution compliance.
- Error and unavailable states.
- A usable non-map fallback if the service is not configured.

Do not hard-code secrets into frontend code, source control or generated public files.

## 8.3 Maps acceptance criteria

- A user can open a supported city or place.
- The map or a clear fallback appears.
- Selecting a marker opens relevant place context.
- Place context links to associated stories and meaningful connections.
- The interface does not imply live location awareness unless location permissions and that feature are explicitly implemented.
- The prototype labels any seeded or sample place records accurately.

# 9. Photos, images and other media

Visual storytelling should make the product culturally rich without introducing copyright risk or fabricated authenticity.

## 9.1 Media source policy

Prefer:

1. Official government or institutional media with permitted use.
2. Museum and archive images whose licences allow the intended display.
3. Properly licensed open-access photographs and collections.
4. Commissioned or explicitly licensed material.
5. Other media only when its usage terms are verified.

A publicly visible image is not automatically free to reuse.

## 9.2 Media metadata

Each asset should track:

- Asset ID and canonical source URL.
- Title or caption.
- Creator or photographer, when known.
- Publisher or collection.
- Licence and permitted usage.
- Attribution requirements.
- Related place, person, artefact or story.
- Original language and descriptive metadata.
- Alt text and accessibility information.
- Authenticity status.
- Review status and last verification date.

## 9.3 Visual authenticity rules

- Never present AI-generated historical imagery as an authentic archival photograph.
- Label reconstructions, illustrations and generated visualisations clearly.
- Do not use unrelated stock images simply to fill empty space.
- Respect sacred, restricted or sensitive visual material.
- Do not infer historical identity from an image without sufficient evidence.
- Use image fallbacks when an asset is missing or not licensed for display.

# 10. Multilingual product requirements

## 10.1 Launch languages

The established launch commitment is 11 languages:

1. English
2. Hindi
3. Kannada
4. Malayalam
5. Bengali
6. Tamil
7. Marathi
8. Telugu
9. Gujarati
10. Punjabi
11. Odia

The commitment is full core-journey support, not merely translated navigation labels.

## 10.2 Required coverage

Each supported language must cover:

- Authentication and language selection.
- Navigation, search and discovery collections.
- Flagship stories.
- AI questions and responses.
- Connection titles and explanations.
- Source-panel labels and source metadata where available.
- Feedback, reporting and error states.
- Settings and privacy screens.

## 10.3 Language handling

- Preserve culturally meaningful original terms where translation loses meaning.
- Support alternate names, transliteration and regional spelling variants.
- Display the original source language when a reference is not available in the selected language.
- Do not silently substitute an unrelated translation.
- Preserve user-selected language through the active session.
- Avoid claiming that a language is fully supported until its quality checks pass.

## 10.4 Quality gates

Every launch language requires:

- Native or qualified linguistic review.
- Cultural terminology review.
- Correct script and font rendering.
- Layout testing for text expansion and line wrapping.
- Question-and-answer quality testing.
- Source and citation display testing.
- Sensitive-content review.
- End-to-end tests of the discovery journey.

A model's ability to produce text in a language is not proof of product-level language readiness.

# 11. UI/UX design principles

The product should feel like an editorial cultural journal combined with an intelligent discovery interface—not a generic chatbot, a tourism booking app or a government database.

## 11.1 Experience principles

1. Curiosity before complexity: Make it easy to start with an incomplete question.
2. Context before detail: Explain why a topic matters before presenting excessive information.
3. Evidence without clutter: Sources are accessible without interrupting every paragraph.
4. Connections with meaning: Explain relationships rather than listing keywords.
5. Culture is living: Include contemporary communities, practices and change alongside historical material.
6. Multiple perspectives: Represent credible differences without pretending all claims have equal evidentiary support.
7. Visual restraint: Let real cultural imagery and editorial content carry the experience.
8. Accessible by default: Support keyboard use, screen readers, readable contrast and all launch scripts.
9. No false authority: Never use visual styling to imply a level of verification that the system has not earned.
10. Graceful failure: If AI, maps or external content fail, users can still explore the content that is available.

## 11.2 Recommended visual direction: Living Editorial Atlas

This is a proposed custom design system for TattvaCo, not an existing commercial UI kit.

## Colour palette

Canvas

\#F7F5EF

Surface

\#FFFFFF

Forest

\#245746

Forest hover

\#1B4437

Terracotta

\#B85E43

Charcoal

\#2B3030

Muted text

\#5E6662

Border

\#DCDDD4

Proposed tokens. Verify colour contrast and component states before production use.

### Typography

- Use a refined editorial serif for selected hero and story headings.
- Use a highly legible sans-serif for navigation, body text, controls, metadata and AI answers.
- Select font families with suitable coverage for all 11 scripts.
- Provide reliable fallback fonts.
- Do not use a decorative display font for long passages or source details.

Recommended starting scale:

| Element         | Desktop  | Mobile   |
| --------------- | -------- | -------- |
| Hero title      | 44–52 px | 32–36 px |
| Page title      | 32 px    | 28 px    |
| Section title   | 24 px    | 22 px    |
| Card title      | 18–20 px | 18 px    |
| Body            | 17–18 px | 16–17 px |
| Supporting text | 14–15 px | 14 px    |
| Metadata        | 12–13 px | 12–13 px |

These values are starting points. Test them across scripts, devices and actual content.

### Layout and spacing

- Base spacing unit: 4 px.
- Card radius: 10–12 px.
- Control radius: 4–6 px.
- Feature-panel radius: 16 px.
- Mobile side padding: approximately 20 px, adjusted for narrow screens.
- Desktop reading width: approximately 680–760 px.
- Touch targets: approximately 44 × 44 px or larger where practical.
- Use generous whitespace around stories and meaningful connections.
- Keep secondary metadata visually quieter than primary content.

### Component library

The implementation should include reusable components for:

- Header and responsive navigation.
- Authentication panels.
- Language selector.
- Search field and Ask composer.
- City and collection cards.
- Story cards and hero media.
- Story-section renderer.
- Connection cards.
- Evidence panel and source-detail view.
- Epistemic labels and uncertainty notices.
- Map and place-detail cards.
- Loading, error, empty and partial-result states.
- Report-issue form.
- Share controls.
- Settings and account controls.
- Confirmation dialogs and accessible notifications.

Use consistent spacing, typography, focus states, loading behaviour and error handling across all screens.

# 12. Screen-by-screen wireframes

These are implementation-oriented wireframe definitions. Each specifies the screen's purpose, layout, behaviour and important states. They are not claims that a separate design tool has already generated these screens.

## Screen 1 — Welcome and authentication

# TattvaCo

## Discover the stories behind culture.

Explore India's cultural universe through context, evidence and meaningful connections.

Continue with Google

Continue with Apple

Continue with email

Continue with phone

Wireframe preview: controls must connect to real authentication flows in the running prototype.

Purpose: Introduce the product and provide access.

Layout, top to bottom

- Wordmark.
- Main heading and short value proposition.
- Google, Apple, email and phone options.
- Sign-in/sign-up and recovery flows where needed.
- Terms and privacy links.

Required states: Loading, invalid input, provider failure, verification, expired code, recovery and successful authentication.

Acceptance criteria: No dead authentication buttons. Where credentials are unavailable, show an explicit configuration state rather than a fake successful login.

## Screen 2 — Language selection

Purpose: Let users select their experience language.

Layout

- Heading: “Choose your language.”
- Language list with native-language labels.
- Selected-state indicator.
- Continue button.
- Ability to change the language later.

Behaviour: Apply the chosen language consistently across navigation, labels, story content and subsequent screens. Avoid mixing scripts unnecessarily.

States: Loading translations, incomplete content, language unavailable and language changed.

## Screen 3 — Discover home

## Discover

## Where will your curiosity take you?

Start with a place, a tradition, a person—or a question.

Ask anything about Indian culture…

### Explore India's cultural universe

[Vande Bharat Express to link Varanasi, Chitrakoot, and Khajuraho; what this means for India’s spiritual and heritage tourism | - The Times of India](https://images.openai.com/static-rsc-4/poNg4Qufu-O2_5U4fZjZ3w68w12jhN15zq9rkWpd7zP--3eoonpo5Ug6L5qREV54a46tnxruqNNq176hCpGTCiU1-pj0MBihxuYXDAJTkCZYZ1kizrUjJkIATp9Zgg_cRqI8Qc94QsUfcff6ZrMHrRqJOn5vyTRXLMVCA2vD-xY?purpose=inline)

Places

Cities, landscapes and heritage

[What Makes a Kanchipuram Silk Saree Truly Authentic?](https://images.openai.com/static-rsc-4/ldfm1iaLB61aVFZ7K_PqPPDPzSvsjn_SgAe6WzRAthfw-eNnWkGAIznuNC2zwfRtnQg83L3RFGKliFMAonGsS1c6tbosPOtZ2pfR33y6mtBgR_JdsnT4jmByHf7kvRMwN5l72c-Pl2BJbzuWGJ4TbFO7QXQ3a83H_g4JWDOkttQ?purpose=inline)

Crafts and living culture

Materials, people and practices

### Start with a city

Varanasi

Jaipur

Hampi

Kochi

Kolkata

Madurai

Purpose: Provide multiple entry points without requiring the user to formulate a perfect question.

Layout

1. Compact header and language/account access.
2. Search/Ask field.
3. Curated discovery themes.
4. Six pilot-city entry points.
5. Featured flagship stories.
6. Meaningful connections or “Explore further” suggestions.

Behaviour

- Search submits a real query.
- Theme and city cards navigate to relevant content.
- Featured stories open approved content.
- Connections open the relevant subject, not a generic search page.
- Loading and empty states preserve navigation.

Acceptance criteria: The page is useful even when the user has no question in mind.

## Screen 4 — Theme or collection page

Purpose: Let users explore a topic through a curated set of stories and relationships.

Layout

- Collection title and short introduction.
- Relevant hero media.
- Featured story.
- Additional stories grouped by theme.
- Related entities and alternate directions.
- Search or Ask entry point.

Behaviour: Users can move between stories and connections without returning to home.

Acceptance criteria: Collection membership is content-driven; do not populate a collection with irrelevant filler.

## Screen 5 — City overview

Purpose: Introduce a pilot city as a connected cultural ecosystem.

Layout

- City title and orientation.
- Appropriate hero photograph.
- Map or location panel.
- Cultural themes.
- Flagship story cards.
- Related people, traditions, crafts, food, festivals and communities.
- Links to other supported places and themes.

Behaviour

- Selecting a story opens its full page.
- Selecting a map marker opens its place detail.
- Selecting a theme opens the relevant collection.
- Place data and media display their provenance as appropriate.

Acceptance criteria: The city page presents a meaningful entry into cultural exploration, not just a list of attractions.

## Screen 6 — Flagship story detail

Purpose: Provide the primary editorial reading experience.

Layout

1. Breadcrumb or back navigation.
2. Story title and orientation.
3. Hero image and attribution, if used.
4. Narrative sections.
5. Relevant context and significance.
6. Epistemic labels where needed.
7. Consolidated evidence and further reading.
8. Meaningful connection cards.
9. Ask a follow-up entry point.
10. Share and report controls.

Behaviour

- Long-form reading is comfortable on mobile and desktop.
- Evidence opens without losing reading position.
- Connections navigate to the relevant subject.
- Follow-up questions use the current story as session context.
- Share creates a link to the published story only.

Acceptance criteria: Every public flagship story has editorial approval, a valid content version and traceable sources.

## Screen 7 — Ask TattvaCo

Purpose: Enable open-ended cultural Q&A that leads to further exploration.

Layout

- Page heading and short orientation.
- Question composer.
- Optional prompt examples.
- Answer area.
- Evidence and further-reading panel.
- Related discoveries.
- Follow-up composer.

Example prompt: “How are the Ganga, Kashi and pilgrimage connected?”

Behaviour

1. Submit the question.
2. Show a clear research/loading state.
3. Retrieve evidence.
4. Generate a contextualised answer.
5. Run validation checks.
6. Render the answer and evidence.
7. Offer a few meaningful next discoveries.
8. Allow follow-up or branching to a different subject.

Required states: Empty prompt, unsupported query, insufficient evidence, conflicting sources, retrieval failure, generation failure and partial answer.

Acceptance criteria: The interface must not fabricate a completed answer or pretend a failed retrieval succeeded.

## Screen 8 — Evidence panel

Purpose: Let users inspect sources without disrupting the reading experience.

Layout

- Panel heading: “Evidence & further reading.”
- Sources grouped by relevance or story section.
- Source title, publisher and source type.
- Publication date where available.
- Supporting passage or explanation where appropriate.
- Direct original-source link.
- Conflicting evidence or limitations, if relevant.

Behaviour: Opening a source opens a detail view or the original source safely. The user can return to the exact place in the story or answer.

Acceptance criteria: Every displayed citation corresponds to a real retrieved or editorially linked source. No invented URLs or source metadata.

## Screen 9 — Connection detail

Purpose: Explain why two subjects are connected and enable further branching.

Layout

- Starting entity.
- Target entity.
- Relationship label.
- Explanation of the relationship.
- Relevant historical or cultural context.
- Supporting evidence.
- Related stories and next connections.

Behaviour: The user can continue exploring from either entity or ask why the connection matters.

Acceptance criteria: The relationship is meaningful, supported and appropriately qualified.

## Screen 10 — Map and place detail

Purpose: Connect geography with cultural context.

Layout

- Map or fallback location card.
- Place name and short orientation.
- Relevant story links.
- Cultural significance.
- Evidence and practical visitor information, if supported.
- External directions link where appropriate.

Behaviour: Map selection and story navigation work together. If Google Maps is not configured, show an explicit fallback rather than a broken blank area.

Acceptance criteria: No fabricated map results, place coordinates or live-location claims.

## Screen 11 — Share story or connection

Purpose: Share a published cultural discovery.

Layout

- Preview of the story or connection.
- Share-link action.
- Copy-link action.
- Clear confirmation or error state.

Behaviour: Share only public, approved content. Do not include private conversation history, personal identifiers or hidden session tokens.

Acceptance criteria: The copied URL resolves to the intended item and remains stable when content is published.

## Screen 12 — Report an issue

Purpose: Allow users to report errors or concerns.

Layout

- Issue category: inaccurate information, missing source, cultural sensitivity, translation issue, broken link or other.
- Optional description.
- Submit action.
- Confirmation.

Behaviour: Store the report securely with a content reference and enough diagnostic context for review, minimising personal data.

Acceptance criteria: A submitted report reaches a real backend or clearly identified prototype queue. A success message must not appear if submission failed.

## Screen 13 — Settings and account

Purpose: Provide control over language, account and privacy.

Layout

- Current language and change action.
- Account details.
- Session sign-out.
- Privacy information.
- Data and account actions appropriate to the chosen backend.
- Help and report issue.

Acceptance criteria: Settings change actual application state. Do not expose persistent personalisation features that have not been approved.

## Screen 14 — Editorial review interface

Recommended internal tool, separate from the public B2C experience.

Purpose: Support source review, story approval and corrections.

Layout

- Draft queue.
- Story and claim review.
- Source references and evidence passages.
- Connection review.
- Language review status.
- Approve, reject and request-correction actions.
- Version history and audit information.

Acceptance criteria: Public flagship content cannot bypass editorial approval. If the editorial tool is omitted from the visual prototype, there must still be a defined content approval process before publishing.

# 13. Global interaction and responsive behaviour

## 13.1 Mobile

- Single-column layouts.
- Compact navigation with clear destinations.
- Large enough touch targets.
- Readable long-form content.
- Evidence displayed in a drawer or expandable panel.
- Connections arranged vertically or in a simple horizontal carousel where useful.
- Maps must remain usable without horizontal page overflow.
- Preserve question input and navigation state when practical.

## 13.2 Tablet

- Wider story column.
- Multi-column collections.
- More space for evidence and related connections.
- Map and story layouts may use a split view if it improves comprehension.

## 13.3 Desktop

- Comfortable editorial reading width.
- Wider discovery grids.
- Optional secondary evidence/connection panel.
- Efficient navigation between collections and stories.
- No unnecessary whitespace that makes the content feel disconnected.

## 13.4 Universal states

Every relevant screen must account for:

- Loading.
- Empty results.
- Partial results.
- Network or API error.
- Authentication failure.
- Unsupported language or missing translation.
- Missing media.
- Missing or unavailable source.
- Insufficient evidence.
- Conflicting evidence.
- Restricted content.
- Unpublished content.
- Report submission failure.
- Permission or configuration failure.

# 14. Technical implementation blueprint

The following is the recommended implementation baseline for a working prototype. It is not a claim that the stack has already been configured in your repository.

## 14.1 Recommended stack

| Layer            | Recommended choice                                                                        | Purpose                                                        |
| ---------------- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Frontend         | Next.js, React, TypeScript                                                                | Responsive web application                                     |
| UI styling       | Tailwind CSS and shadcn/ui, with a custom TattvaCo design system                          | Reusable components and consistent styling                     |
| Backend API      | Python and FastAPI, or a simpler integrated backend if the repository already supports it | Research, retrieval, content and session endpoints             |
| Primary database | PostgreSQL                                                                                | Content, entities, users, source registry and relationships    |
| Vector retrieval | pgvector or an equivalent managed vector index                                            | Semantic retrieval over indexed cultural material              |
| Object storage   | S3-compatible storage                                                                     | Licensed media, document assets and controlled uploads         |
| AI gateway       | Provider abstraction                                                                      | Model switching, retries, cost tracking and structured outputs |
| Maps             | Google Maps Platform                                                                      | Map and place interfaces, subject to credentials               |
| Authentication   | Secure managed authentication or an equivalent provider                                   | Email, phone, Google and Apple access                          |
| Deployment       | Existing supported deployment platform                                                    | Hosting, environment configuration and preview deployments     |
| Monitoring       | Application logs, error tracking and usage/cost instrumentation                           | Debugging and operational visibility                           |

Important implementation rule: Inspect the existing repository before changing its architecture. Reuse a working database, routing system, authentication layer or deployment setup when that is the safer and faster path. Do not introduce a separate service merely because it appears in this specification.

## 14.2 Minimum database model

The prototype should have a structured content model, not depend on hard-coded cards and a single prompt.

users / sessions

Authentication identity, language preference where permitted, active session and security metadata.

entities

Places, people, traditions, events, crafts, foods, communities, concepts and objects.

stories

Published narrative, sections, language, status, version, hero media and editorial metadata.

sources

Canonical URL, publisher, source type, licence, retrieval method, timestamps and availability.

documents / passages

Indexed source material, extracted passages, document versions and retrieval metadata.

claims / evidence

Claims, supporting or conflicting passages, evidence type, source links and review status.

relationships

Entity pairs, relationship type, rationale, supporting evidence, confidence assessment and status.

media assets

Asset source, creator, usage rights, attribution, alt text, authenticity and review status.

reports / audit events

User reports, review decisions, correction history and content-change records.

## 14.3 Entity and relationship model

Examples of supported relationships:

- `PERSON → lived_in → PLACE`
- `DYNASTY → ruled → REGION`
- `MONUMENT → built_during → PERIOD`
- `ARTIFACT → held_by → MUSEUM`
- `TRADITION → practiced_by → COMMUNITY`
- `TEXT → references → PERSON`
- `FESTIVAL → associated_with → PLACE`
- `CRAFT → practiced_in → REGION`

These are examples of a data vocabulary, not claims that every relationship has been verified.

Each relationship must be traceable to evidence or a reviewed editorial explanation.

## 14.4 API surface

The working prototype should provide equivalent backend operations for:

- Authentication and session management.
- Language and configuration retrieval.
- Search and discovery collections.
- City and place details.
- Published stories and story sections.
- AI question submission and answer retrieval.
- Evidence/source listing and source detail.
- Connection discovery and connection detail.
- Media retrieval.
- Share-link resolution.
- Issue reporting.
- Editorial review and correction.
- Health checks and runtime diagnostics.

The exact routes and payloads should be defined against the existing codebase. Avoid duplicating endpoints or creating frontend-only simulations of backend functionality.

## 14.5 Security and privacy

- Keep provider secrets and API credentials outside public frontend bundles.
- Use server-side validation for protected operations.
- Protect against unauthorised editorial actions.
- Enforce access controls on unpublished content and private reports.
- Avoid placing private conversation data in URLs.
- Limit logs to what is needed for diagnostics and evaluation.
- Set clear retention and deletion policies.
- Use appropriate rate limits for AI and external API calls.
- Avoid storing persistent cultural-interest profiles or long-term AI memory unless separately approved.
- Respect the data handling requirements of authentication, map, AI and analytics providers.

# 15. Content operations and editorial governance

A working product needs an operational process for maintaining the knowledge it displays.

## 15.1 Content lifecycle

\#chatgpt-mermaid-\_r_2jn\_{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;fill:rgb(13, 13, 13);}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#chatgpt-mermaid-\_r_2jn\_ .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2jn\_ .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#chatgpt-mermaid-\_r_2jn\_ .error-icon{fill:rgb(243, 243, 243);}#chatgpt-mermaid-\_r_2jn\_ .error-text{fill:rgb(13, 13, 13);stroke:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ .edge-thickness-normal{stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .edge-thickness-thick{stroke-width:3.5px;}#chatgpt-mermaid-\_r_2jn\_ .edge-pattern-solid{stroke-dasharray:0;}#chatgpt-mermaid-\_r_2jn\_ .edge-thickness-invisible{stroke-width:0;fill:none;}#chatgpt-mermaid-\_r_2jn\_ .edge-pattern-dashed{stroke-dasharray:3;}#chatgpt-mermaid-\_r_2jn\_ .edge-pattern-dotted{stroke-dasharray:2;}#chatgpt-mermaid-\_r_2jn\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2jn\_ .marker.cross{stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2jn\_ svg{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:16px;}#chatgpt-mermaid-\_r_2jn\_ p{margin:0;}#chatgpt-mermaid-\_r_2jn\_ .label{font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ .cluster-label text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ .cluster-label span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ .cluster-label span p{background-color:transparent;}#chatgpt-mermaid-\_r_2jn\_ .label text,#chatgpt-mermaid-\_r_2jn\_ span{fill:rgb(13, 13, 13);color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ .node rect,#chatgpt-mermaid-\_r_2jn\_ .node circle,#chatgpt-mermaid-\_r_2jn\_ .node ellipse,#chatgpt-mermaid-\_r_2jn\_ .node polygon,#chatgpt-mermaid-\_r_2jn\_ .node path{fill:rgb(222, 234, 251);stroke:rgb(83, 154, 248);stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .rough-node .label text,#chatgpt-mermaid-\_r_2jn\_ .node .label text,#chatgpt-mermaid-\_r_2jn\_ .image-shape .label,#chatgpt-mermaid-\_r_2jn\_ .icon-shape .label{text-anchor:middle;}#chatgpt-mermaid-\_r_2jn\_ .node .katex path{fill:#000;stroke:#000;stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .rough-node .label,#chatgpt-mermaid-\_r_2jn\_ .node .label,#chatgpt-mermaid-\_r_2jn\_ .image-shape .label,#chatgpt-mermaid-\_r_2jn\_ .icon-shape .label{text-align:center;}#chatgpt-mermaid-\_r_2jn\_ .node.clickable{cursor:pointer;}#chatgpt-mermaid-\_r_2jn\_ .root .anchor path{fill:rgb(143, 143, 143)!important;stroke-width:0;stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2jn\_ .arrowheadPath{fill:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2jn\_ .edgePath .path{stroke:rgb(143, 143, 143);stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .flowchart-link{stroke:rgb(143, 143, 143);fill:none;}#chatgpt-mermaid-\_r_2jn\_ .edgeLabel{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2jn\_ .edgeLabel p{background-color:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2jn\_ .edgeLabel rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2jn\_ .labelBkg{background-color:rgba(252, 252, 252, 0.5);}#chatgpt-mermaid-\_r_2jn\_ .cluster rect{fill:rgb(243, 243, 243);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .cluster text{fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ .cluster span{color:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ div.mermaidTooltip{position:absolute;text-align:center;max-width:200px;padding:2px;font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";font-size:12px;background:rgb(243, 243, 243);border:1px solid rgba(0, 0, 0, 0.1);border-radius:2px;pointer-events:none;z-index:100;}#chatgpt-mermaid-\_r_2jn\_ .flowchartTitleText{text-anchor:middle;font-size:18px;fill:rgb(13, 13, 13);}#chatgpt-mermaid-\_r_2jn\_ rect.text{fill:none;stroke-width:0;}#chatgpt-mermaid-\_r_2jn\_ .icon-shape,#chatgpt-mermaid-\_r_2jn\_ .image-shape{background-color:rgb(252, 252, 252);text-align:center;}#chatgpt-mermaid-\_r_2jn\_ .icon-shape p,#chatgpt-mermaid-\_r_2jn\_ .image-shape p{background-color:rgb(252, 252, 252);padding:2px;}#chatgpt-mermaid-\_r_2jn\_ .icon-shape .label rect,#chatgpt-mermaid-\_r_2jn\_ .image-shape .label rect{opacity:0.5;background-color:rgb(252, 252, 252);fill:rgb(252, 252, 252);}#chatgpt-mermaid-\_r_2jn\_ .label-icon{display:inline-block;height:1em;overflow:visible;vertical-align:-0.125em;}#chatgpt-mermaid-\_r_2jn\_ .node .label-icon path{fill:currentColor;stroke:revert;stroke-width:revert;}#chatgpt-mermaid-\_r_2jn\_ .node .neo-node{stroke:rgb(83, 154, 248);}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node rect,#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].cluster rect,#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node polygon{stroke:url(#chatgpt-mermaid-\_r_2jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].swimlane.cluster rect{filter:none;}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node path{stroke:url(#chatgpt-mermaid-\_r_2jn\_-gradient);stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node .outer-path{filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node .neo-line path{stroke:rgb(83, 154, 248);filter:none;}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node circle{stroke:url(#chatgpt-mermaid-\_r_2jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].node circle .state-start{fill:#000000;}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].icon-shape .icon{fill:url(#chatgpt-mermaid-\_r_2jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2jn\_ [data-look="neo"].icon-shape .icon-neo path{stroke:url(#chatgpt-mermaid-\_r_2jn\_-gradient);filter:drop-shadow( 1px 2px 2px rgba(185,185,185,1));}#chatgpt-mermaid-\_r_2jn\_ .node text{font-size:14px;font-weight:600;letter-spacing:normal;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2jn\_ .edgeLabels text{font-size:13px;font-weight:600;letter-spacing:-0.08px;fill:rgb(0, 79, 153);}#chatgpt-mermaid-\_r_2jn\_ .node tspan[font-weight="normal"],#chatgpt-mermaid-\_r_2jn\_ .edgeLabels tspan[font-weight="normal"]{font-weight:600;}#chatgpt-mermaid-\_r_2jn\_ .edgeLabel .label rect{opacity:1;rx:13px;ry:13px;fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .node rect,#chatgpt-mermaid-\_r_2jn\_ .node circle,#chatgpt-mermaid-\_r_2jn\_ .node ellipse,#chatgpt-mermaid-\_r_2jn\_ .node polygon,#chatgpt-mermaid-\_r_2jn\_ .node path{fill:rgb(229, 243, 255);stroke:rgba(0, 0, 0, 0.1);stroke-width:1px;}#chatgpt-mermaid-\_r_2jn\_ .node rect{rx:16px;ry:16px;}#chatgpt-mermaid-\_r_2jn\_ .node.mermaid-decision .label-container{fill:rgb(245, 250, 255);stroke:rgb(206, 219, 229);stroke-dasharray:2,2;}#chatgpt-mermaid-\_r_2jn\_ .edgePaths .flowchart-link{stroke:rgb(143, 143, 143);stroke-width:1px;stroke-linecap:round;stroke-linejoin:round;}#chatgpt-mermaid-\_r_2jn\_ .marker{fill:rgb(143, 143, 143);stroke:rgb(143, 143, 143);}#chatgpt-mermaid-\_r_2jn\_ :root{--mermaid-font-family:-apple-system-body,ui-sans-serif,-apple-system,system-ui,"Segoe UI",Helvetica,"Apple Color Emoji",Arial,sans-serif,"Segoe UI Emoji","Segoe UI Symbol";}Discover SourceIngest and RecordProvenanceExtract and StructureCreate Claims andConnectionsResearch and VerifyEditorial ReviewApproved?Publish VersionRevise or RejectMonitor and CollectFeedbackCorrection / UpdateYesNo

## 15.2 Required editorial controls

- Story approval before public publication.
- Evidence and media review.
- Language-specific review.
- Connection approval or automated verification appropriate to risk.
- Correction and withdrawal workflow.
- Version history.
- Review ownership and timestamps.
- Escalation for sensitive or contested content.
- Source availability and usage-rights review.
- Auditability of changes to public content.

## 15.3 Cultural sensitivity

The product must distinguish among historical evidence, religious belief, traditional accounts, scholarly interpretation and contemporary community perspectives.

It must not:

- Present a religious account as independently established historical fact without evidence.
- Treat one community's interpretation as universally representative.
- Manufacture certainty where sources conflict.
- Use restricted cultural knowledge merely because it can be found online.
- Present a generated interpretation as an authoritative cultural ruling.

Where community consent or cultural restrictions are relevant, the product should avoid publication until the appropriate review and permission conditions are satisfied.

# 16. Analytics and success measurement

The prototype needs enough measurement to determine whether it is delivering meaningful discovery, rather than just generating content.

## 16.1 North-star outcome

Meaningful Discovery Rate (MDR)

Recommended definition:

The percentage of eligible discovery sessions in which a user reaches a meaningful content item, explores at least one supported connection or related subject, and completes a useful next step.

The exact denominator, qualifying actions and session boundaries must be finalised before comparing results.

## 16.2 Supporting metrics

| Metric                      | What it measures                                                  |
| --------------------------- | ----------------------------------------------------------------- |
| Discovery start rate        | Whether users engage with a browse, search or Ask entry point     |
| Story engagement            | Whether users meaningfully read or interact with flagship stories |
| Connection exploration rate | Whether users open relevant connected subjects                    |
| Discovery continuation rate | Whether users move from one subject to another                    |
| Evidence inspection rate    | Whether users choose to inspect sources                           |
| Search success rate         | Whether search produces relevant content or a usable answer       |
| Answer usefulness           | User feedback on relevance and comprehension                      |
| Trust feedback              | User perception of evidence quality and transparency              |
| Source validity rate        | Whether displayed references resolve to the intended material     |
| Unsupported claim rate      | Rate of material claims failing the evaluation criteria           |
| Language quality            | Quality by language and content type                              |
| Technical success rate      | Completion of key flows without application errors                |
| Cost per successful answer  | AI and retrieval cost associated with a usable response           |

Evidence inspection is a useful signal, but not opening a source does not automatically mean a user distrusts the answer.

## 16.3 Evaluation framework

Before public release, create an evaluation set covering:

- Factual questions with clear documentary support.
- Questions involving cultural traditions and beliefs.
- Questions where sources disagree.
- Questions where official records are incomplete.
- Questions about living communities.
- Alternate spellings and multilingual queries.
- Unsupported or unanswerable questions.
- Source failures and external API errors.
- Connection recommendations.
- Culturally sensitive or restricted content.

Evaluate factual support, citation validity, uncertainty handling, relevance, cultural sensitivity, language quality and discovery usefulness separately.

Do not use a single generic “AI accuracy” score as the only release criterion.

# 17. Prototype implementation plan

The goal is a working product experience—not a set of static screens and not a claim of production readiness.

## Phase 1 — Foundation

- Inspect the repository and all relevant product documents.
- Confirm the application entry point, framework and existing integrations.
- Implement the design tokens and responsive layout.
- Set up routes, core components and error states.
- Establish the minimum data model and content contract.
- Implement authentication or an explicit, safe development-mode configuration.

Exit condition: The app starts reliably and navigation is real.

## Phase 2 — Core discovery experience

- Build Discover home.
- Build collection and city pages.
- Build story detail.
- Implement search and entity navigation.
- Implement the connection model and detail view.
- Seed clearly labelled demonstration content for all six cities.

Exit condition: Users can complete a browse → story → connection → further-discovery journey.

## Phase 3 — Research and evidence

- Build the source registry.
- Ingest an initial, permission-checked set of government and institutional sources.
- Implement retrieval and source passage storage.
- Add external research capability where supported.
- Build the evidence panel.
- Implement claim-support checks, uncertainty and source failure states.

Exit condition: A user can ask a cultural question and inspect genuine underlying references for the claims presented as sourced.

## Phase 4 — Maps and visual media

- Configure Google Maps Platform credentials and permitted services.
- Implement map and place-detail views.
- Populate the media registry with rights-checked assets.
- Add attribution, captions, alt text and fallbacks.

Exit condition: Map and media experiences work with valid configuration, and fail gracefully without it.

## Phase 5 — Multilingual support and governance

- Implement the 11-language framework.
- Localise interface and core journey.
- Implement story approval, content versions and issue reporting.
- Run language-specific content and UI checks.
- Validate sensitive-content behaviour.

Exit condition: Each language and public flagship story passes its defined quality gate.

## Phase 6 — End-to-end QA and demonstration readiness

- Test every primary journey.
- Test external service failures.
- Verify citations and share links.
- Test mobile, tablet and desktop.
- Check accessibility and privacy.
- Verify that the demo environment contains no secrets.
- Prepare a clearly labelled demonstration dataset and an integration-status checklist.

Exit condition: The demonstrated core journey works from start to finish without hidden manual steps or misleading claims about live integrations.

# 18. Working prototype definition of done

A prototype is not complete just because every screen exists.

## 18.1 End-to-end acceptance tests

## Prototype readiness checklist

0/22 checked

Discovery

User can open Discover and browse without needing a question.

All six city collections are navigable.

A city opens relevant stories, themes and place context.

A story opens a meaningful connection and another discovery.

AI and evidence

User can submit a cultural question.

Answer generation uses the configured retrieval path.

Source references correspond to real source records.

Insufficient evidence and conflicting sources produce qualified outcomes.

The UI consolidates sources rather than repeating a link after every line.

Maps and media

Map works when valid credentials and services are configured.

Missing Maps configuration produces a clear fallback.

Displayed images have recorded source and usage metadata.

Missing or restricted media does not break the layout.

Languages and governance

Language selection affects the actual core journey.

Content availability is tracked per language.

Flagship stories cannot bypass required approval.

Report and correction flows produce a real recorded result.

Technical quality

Navigation, back button and share links work.

Loading, empty and error states are tested.

Responsive layouts work on mobile, tablet and desktop.

Secrets are not exposed and private session data is not shared.

Logs and evaluation events do not unnecessarily collect personal data.

This is a planning checklist. Checking a box here does not run tests against your application or verify an integration.

## 18.2 Demo data versus live integrations

Every external dependency should have an explicit status:

- Live and tested: Connected and verified in the current environment.
- Configured but unverified: Credentials or configuration exist, but the end-to-end flow has not passed testing.
- Demo data: Curated example content that is not represented as live retrieved data.
- Simulated: Behaviour is intentionally mocked for the demonstration.
- Unavailable: The required dependency is not configured.
- Not implemented: The capability is outside the current build.

This distinction is essential for a credible government-facing demonstration.

# 19. Government-facing demonstration requirements

The product should be compelling to government and cultural institutions because it demonstrates how existing cultural knowledge can become more discoverable, connected and understandable—not because it claims to have already digitised or verified all of India's cultural heritage.

## Recommended demonstration journey

1\. Begin with Varanasi

Open the city overview, map and cultural themes.

2\. Explore a flagship story

Demonstrate contextual narrative, appropriate media and evidence.

3\. Follow an unexpected connection

Move from a place to a tradition, craft or living community and understand why the relationship matters.

4\. Ask an open-ended question

Show research-grounded answers, source inspection and uncertainty handling.

5\. Switch language

Demonstrate a genuine translated core journey, not just a translated home screen.

For the demonstration, prepare a small set of thoroughly reviewed stories and evidence-rich questions rather than relying on untested, broad live queries. The demo should clearly distinguish verified live source integrations from curated demonstration material.

Do not imply government endorsement, partnerships, privileged data access or nationwide coverage unless independently established.

# 20. Final source-of-truth and decision register

This specification consolidates the current product baseline. The following items remain open and must not be silently invented during implementation.

| Decision                         | Recommended handling                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------- |
| Public access to shared links    | Decide whether sign-in is required before opening published stories                         |
| Authentication providers         | Confirm actual provider configuration and credentials                                       |
| Source access and permissions    | Verify source-by-source; distinguish open, licensed, restricted and inaccessible data       |
| Initial source inventory         | Register exact canonical URLs and test access                                               |
| Secondary research provider      | Select an implementation that supports source traceability and permitted external retrieval |
| Google Maps services             | Select required APIs, configure restrictions, quotas and billing                            |
| AI model and retrieval vendor    | Choose after evaluating evidence quality, multilingual performance, cost and security       |
| Sensitive-topic policy           | Define categories, escalation and abstention rules                                          |
| Language QA thresholds           | Set measurable acceptance criteria and review ownership per language                        |
| Story inventory                  | Select and approve the first 18–24 stories                                                  |
| Media rights                     | Verify licensing and attribution for every displayed asset                                  |
| Performance and cost targets     | Define measurable thresholds after technical testing                                        |
| Privacy and retention            | Confirm policies and implement deletion and retention behaviour                             |
| Analytics and success thresholds | Establish baseline, measurement definitions and pilot decision criteria                     |
| Editorial operations             | Assign owners and correction-review expectations                                            |

## Final product decision

TattvaCo should be built as a source-grounded, curiosity-led cultural discovery engine, not as a conventional question-answering chatbot.

Its core experience must combine:

- A structured cultural knowledge model.
- Government-first ingestion and open secondary research.
- Claim-level evidence and source provenance.
- Meaningful, validated relationships.
- Natural source presentation without repetitive inline links.
- Contextual storytelling and living-culture representation.
- Maps and rights-aware media.
- Eleven-language core-journey support.
- Editorial governance, evaluation and transparent failure states.

The most important implementation rule is this: do not fake the intelligence behind the interface. If a connection is not verified, a source is unavailable, a language has not passed review or an external service is not configured, the prototype must represent that state honestly.

This document is the consolidated master specification for the product and working prototype. The remaining work is implementation, configuration, content preparation and verification against the acceptance criteria above. this is updaeted changes