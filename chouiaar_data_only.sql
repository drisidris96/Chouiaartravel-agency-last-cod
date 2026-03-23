--
-- PostgreSQL database dump
--

\restrict RphsE2rmDBuQqxjgUvHzEghDp6BgRPLtASxHFAta3GoQUeZEGtrsQV1O8UKCfVK

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.trips (id, title, description, destination, country, image_url, price, duration, max_capacity, available_spots, start_date, end_date, featured, rating, review_count, includes, created_at) FROM stdin;
1	رحلة باريس الرومانسية	اكتشف جمال باريس، مدينة النور والرومانسية. زيارة برج إيفل، متحف اللوفر، وأحياء باريس الساحرة.	باريس	فرنسا	/images/logo-chouiaar.jpg	850	7	20	20	2026-05-01	2026-05-08	t	4.8	124	{"تذاكر الطيران","الإقامة في فندق 4 نجوم","الإفطار يومياً","مرشد سياحي","تأمين سفر"}	2026-03-23 02:30:20.766982
2	جولة إسطنبول التاريخية	استكشف إسطنبول، مدينة التلاقي بين الشرق والغرب. زيارة آيا صوفيا، القصر العثماني، والبازار الكبير.	إسطنبول	تركيا	/images/logo-chouiaar.jpg	650	6	25	25	2026-04-15	2026-04-21	t	4.7	89	{"تذاكر الطيران","الإقامة في فندق 4 نجوم","الإفطار والعشاء","مرشد سياحي","تأمين سفر","جولات يومية"}	2026-03-23 02:30:20.766982
3	مالديف - جنة الأرض	استمتع بالراحة الكاملة في جزر المالديف الخلابة. شواطئ بيضاء، مياه فيروزية، وإقامة في فيلا مائية.	المالديف	المالديف	/images/logo-chouiaar.jpg	2500	8	10	10	2026-06-10	2026-06-18	t	5	45	{"تذاكر الطيران الدولي","إقامة في فيلا مائية","وجبات كاملة","غطس وسنوركلينج","تأمين سفر","نقل بالطائرة المائية"}	2026-03-23 02:30:20.766982
4	برشلونة الساحرة	اكتشف جمال برشلونة الإسبانية، مدينة الفن والمعمار والشواطئ الجميلة.	برشلونة	إسبانيا	/images/logo-chouiaar.jpg	750	6	20	20	2026-07-01	2026-07-07	f	4.6	67	{"تذاكر الطيران","الإقامة في فندق 3 نجوم","الإفطار يومياً","بطاقة المواصلات","تأمين سفر"}	2026-03-23 02:30:20.766982
5	دبي - مدينة المستقبل	أكتشف دبي الرائعة، مدينة الأحلام والابتكار. برج خليفة، الصحراء العربية، ومراكز التسوق الفاخرة.	دبي	الإمارات العربية المتحدة	/images/logo-chouiaar.jpg	900	5	30	30	2026-04-20	2026-04-25	t	4.9	156	{"تذاكر الطيران","إقامة في فندق 5 نجوم","وجبات كاملة","رحلة الصحراء","جولة برج خليفة","تأمين سفر"}	2026-03-23 02:30:20.766982
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, name, phone, role, reset_token, verification_code, verified, created_at) FROM stdin;
1	admin@chouiaar.com	750dc4f922d5409cfc2b75c2376b9e3a5ecd4dbc7f181e713de13c2977424823	Admin Chouiaar	\N	admin	930036	\N	t	2026-03-23 02:29:53.439077
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, trip_id, user_id, guest_name, guest_email, guest_phone, number_of_people, total_price, status, special_requests, created_at) FROM stdin;
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservations (id, type, first_name, last_name, passport_number, destination, departure_date, return_date, notes, status, created_at) FROM stdin;
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_requests (id, first_name, last_name, address, phone, passport_number, service_description, status, created_at) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
e8aNL6YkNfEKtBB4qyLdaSRw5u8x2bzw	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-30T03:51:48.983Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-03-30 03:51:50
mIKyxRXWtkLg36atwdSOPYzkxPSS7Jps	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-30T03:54:26.259Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-03-30 03:54:27
8nXiOr4K3WIkpe2gO8rR690HnC51lkqo	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-30T03:54:32.843Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-03-30 03:54:33
erMgLwLSVuzD_9NhIObL2s0sf5WvATQc	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-30T04:11:01.320Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-03-30 04:11:02
isZHEOTeL1lz-y96hIkMGt2F78y0M0-C	{"cookie":{"originalMaxAge":604800000,"expires":"2026-03-30T04:16:20.276Z","secure":false,"httpOnly":true,"path":"/","sameSite":"lax"},"userId":1}	2026-03-30 04:16:25
\.


--
-- Data for Name: visa_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visa_requests (id, first_name, last_name, birth_date, birth_place, profession, address, phone, passport_number, passport_issue_date, passport_issue_place, passport_expiry_date, destination, travel_date, visa_type, duration, photo_url, passport_photo_url, notes, status, admin_notes, created_at) FROM stdin;
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservations_id_seq', 1, false);


--
-- Name: service_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_requests_id_seq', 1, false);


--
-- Name: trips_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.trips_id_seq', 5, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: visa_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visa_requests_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict RphsE2rmDBuQqxjgUvHzEghDp6BgRPLtASxHFAta3GoQUeZEGtrsQV1O8UKCfVK

