export type Language = "he" | "ar" | "ru" | "en";

export type Direction = "rtl" | "ltr";

export const languageConfig: Record<Language, { label: string; dir: Direction; flag: string }> = {
  he: { label: "עברית", dir: "rtl", flag: "🇮🇱" },
  ar: { label: "العربية", dir: "rtl", flag: "🇸🇦" },
  ru: { label: "Русский", dir: "ltr", flag: "🇷🇺" },
  en: { label: "English", dir: "ltr", flag: "🇬🇧" },
};

export type TranslationKeys = {
  // Meta / SEO
  meta_title: string;
  meta_description: string;

  // Hero
  hero_headline: string;
  hero_subheadline: string;
  hero_services_line: string;
  hero_cta_free: string;
  hero_cta_personal: string;
  hero_cta_whatsapp: string;
  hero_badge: string;
  hero_social_proof: string;
  hero_how_title: string;
  hero_how_step1: string;
  hero_how_step2: string;
  hero_how_step3: string;
  hero_crystal_hint: string;
  hero_menu_forecast: string;
  hero_menu_rising: string;
  hero_menu_compatibility: string;
  hero_menu_tarot: string;
  hero_menu_palm: string;
  hero_menu_birthchart: string;
  hero_menu_fullchart: string;

  // MysticalNav
  nav_title: string;
  nav_subtitle: string;
  nav_astrology_title: string;
  nav_astrology_desc: string;
  nav_astrology_cta: string;
  nav_compatibility_title: string;
  nav_compatibility_desc: string;
  nav_compatibility_cta: string;
  nav_tarot_title: string;
  nav_tarot_desc: string;
  nav_tarot_cta: string;
  nav_palm_title: string;
  nav_palm_desc: string;
  nav_palm_cta: string;
  zodiac_ruling_sign: string;
  zodiac_planetary_influence: string;

  // About
  about_discover: string;
  about_title: string;
  about_desc: string;
  about_five_gates: string;
  about_astrology_title: string;
  about_astrology_desc: string;
  about_rising_title: string;
  about_rising_desc: string;
  about_compatibility_title: string;
  about_compatibility_desc: string;
  about_tarot_title: string;
  about_tarot_desc: string;
  about_palm_title: string;
  about_palm_desc: string;

  // Launch Banner
  launch_gift: string;
  launch_title: string;
  launch_subtitle: string;
  launch_free_highlight: string;
  launch_includes: string;
  launch_all_included: string;
  launch_days_remaining_prefix: string;
  launch_days_remaining_suffix: string;
  launch_cta: string;

  // Free/Premium Section
  free_title: string;
  free_subtitle: string;
  free_daily_title: string;
  free_daily_desc: string;
  free_taste_title: string;
  free_taste_desc: string;
  free_tarot_title: string;
  free_tarot_desc: string;
  free_cta: string;
  premium_label: string;
  premium_launch_label: string;
  premium_title: string;
  premium_subtitle: string;
  premium_launch_subtitle: string;
  premium_free_label: string;
  premium_launch_period: string;
  premium_popular: string;
  premium_recommended: string;
  premium_cta: string;
  premium_launch_cta: string;
  premium_personal_title: string;
  premium_soul_title: string;
  premium_couple_title: string;

  // Lead Section
  lead_title: string;
  lead_subtitle: string;
  lead_name: string;
  lead_name_placeholder: string;
  lead_birthdate: string;
  lead_phone: string;
  lead_phone_placeholder: string;
  lead_email: string;
  lead_email_placeholder: string;
  lead_interest: string;
  lead_interest_placeholder: string;
  lead_interest_astrology: string;
  lead_interest_compatibility: string;
  lead_interest_tarot: string;
  lead_interest_palm: string;
  lead_interest_full: string;
  lead_message: string;
  lead_message_placeholder: string;
  lead_submit: string;
  lead_submitting: string;
  lead_success_title: string;
  lead_success_text: string;
  lead_secure: string;
  lead_prefer_direct: string;
  lead_whatsapp: string;
  lead_error_required: string;
  lead_error_submit: string;
  lead_error_wait: string;
  lead_error_rate_limit: string;
  lead_error_duplicate: string;

  // Testimonials
  testimonials_title: string;
  testimonials_subtitle: string;

  // FAQ
  faq_label: string;
  faq_title: string;
  faq_subtitle: string;
  faq_q1: string;
  faq_a1: string;
  faq_q2: string;
  faq_a2: string;
  faq_q3: string;
  faq_a3: string;
  faq_q4: string;
  faq_a4: string;
  faq_q5: string;
  faq_a5: string;

  // Footer CTA
  footer_title: string;
  footer_subtitle: string;
  footer_cta_free: string;
  footer_cta_premium: string;
  footer_whatsapp: string;
  footer_copyright: string;

  // Pricing Section
  pricing_label: string;
  pricing_launch_label: string;
  pricing_title: string;
  pricing_launch_title: string;
  pricing_subtitle: string;
  pricing_launch_subtitle: string;
  pricing_launch_badge: string;
  pricing_launch_gift: string;
  pricing_pkg1_title: string;
  pricing_pkg1_desc: string;
  pricing_pkg2_title: string;
  pricing_pkg2_desc: string;
  pricing_pkg3_title: string;
  pricing_pkg3_desc: string;

  // Readings History
  readings_title: string;
  readings_subtitle: string;
  readings_type_forecast: string;
  readings_type_rising: string;
  readings_type_compatibility: string;
  readings_type_tarot: string;
  readings_type_palm: string;
  readings_delete: string;

  // Monthly Forecast Modal
  forecast_title: string;
  forecast_desc: string;
  forecast_birthdate_label: string;
  forecast_gender_label: string;
  forecast_gender_male: string;
  forecast_gender_female: string;
  forecast_gender_other: string;
  forecast_gender_prefer_not: string;
  forecast_gender_required: string;
  forecast_birthdate_required: string;
  forecast_cta: string;
  forecast_free_badge: string;
  forecast_note: string;
  forecast_month_label: string;
  forecast_element_label: string;
  forecast_loading: string;
  forecast_share: string;
  forecast_copy: string;
  forecast_copied: string;
  forecast_premium_title: string;
  forecast_premium_desc: string;
  forecast_premium_cta: string;

  // Compatibility Modal
  compat_title: string;
  compat_desc: string;
  compat_date1_label: string;
  compat_date2_label: string;
  compat_time_optional: string;
  compat_gender_label: string;
  compat_gender_woman: string;
  compat_gender_man: string;
  compat_gender_nonbinary: string;
  compat_gender_other: string;
  compat_gender_prefer_not: string;
  compat_gender_optional: string;
  compat_name_label: string;
  compat_name_placeholder: string;
  compat_relation_label: string;
  compat_relation_me: string;
  compat_relation_partner: string;
  compat_relation_friend: string;
  compat_relation_family: string;
  compat_relation_other: string;
  compat_cta: string;
  compat_score_label: string;
  compat_loading: string;
  compat_share: string;
  compat_premium_title: string;
  compat_premium_desc: string;
  compat_premium_cta: string;

  // Rising Sign Modal
  rising_title: string;
  rising_desc: string;
  rising_birthdate_label: string;
  rising_birthtime_label: string;
  rising_cta: string;
  rising_loading: string;
  rising_sun_label: string;
  rising_asc_label: string;

  // Tarot Modal
  tarot_title: string;
  tarot_desc: string;
  tarot_cta: string;
  tarot_note: string;
  tarot_cards_title: string;
  tarot_card_label: string;
  tarot_meaning: string;
  tarot_love: string;
  tarot_career: string;
  tarot_spiritual: string;
  tarot_advice: string;
  tarot_combined_cta: string;
  tarot_combined_title: string;
  tarot_combined_subtitle: string;
  tarot_combined_loading: string;
  tarot_spread_choose: string;
  tarot_spread_timeline: string;
  tarot_spread_love: string;
  tarot_spread_career: string;
  tarot_spread_decision: string;
  tarot_spread_daily: string;
  tarot_spread_universe: string;
  tarot_spread_timeline_desc: string;
  tarot_spread_love_desc: string;
  tarot_spread_career_desc: string;
  tarot_spread_decision_desc: string;
  tarot_spread_daily_desc: string;
  tarot_spread_universe_desc: string;
  tarot_pos_past: string;
  tarot_pos_present: string;
  tarot_pos_future: string;
  tarot_pos_heart: string;
  tarot_pos_energy: string;
  tarot_pos_direction: string;
  tarot_pos_current: string;
  tarot_pos_challenge: string;
  tarot_pos_opportunity: string;
  tarot_pos_dilemma: string;
  tarot_pos_hidden: string;
  tarot_pos_right_path: string;
  tarot_pos_daily_card: string;
  tarot_pos_universe_msg: string;
  tarot_one_card: string;
  tarot_n_cards: string;
  tarot_mystical_interp: string;
  tarot_premium_title: string;
  tarot_premium_desc: string;
  tarot_premium_cta: string;

  // Tarot World Modal
  tarot_world_title: string;
  tarot_world_desc: string;
  tarot_world_free: string;
  tarot_world_premium: string;
  tarot_world_shuffle: string;
  tarot_world_shuffle_focus: string;
  tarot_world_reveal_hint: string;
  tarot_world_cards_chosen_single: string;
  tarot_world_cards_chosen_plural: string;
  tarot_world_all_revealed: string;
  tarot_world_full_reading: string;
  tarot_world_ai_loading: string;
  tarot_world_premium_title: string;
  tarot_world_premium_desc: string;
  tarot_world_premium_cta: string;
  tarot_world_daily_note: string;
  tarot_world_spread_daily_name: string;
  tarot_world_spread_daily_desc: string;
  tarot_world_spread_timeline_name: string;
  tarot_world_spread_timeline_desc: string;
  tarot_world_spread_love_name: string;
  tarot_world_spread_love_desc: string;
  tarot_world_spread_career_name: string;
  tarot_world_spread_career_desc: string;
  tarot_world_spread_decision_name: string;
  tarot_world_spread_decision_desc: string;
  tarot_world_spread_universe_name: string;
  tarot_world_spread_universe_desc: string;
  tarot_world_pos_today: string;
  tarot_world_pos_past: string;
  tarot_world_pos_present: string;
  tarot_world_pos_future: string;
  tarot_world_pos_heart: string;
  tarot_world_pos_energy: string;
  tarot_world_pos_direction: string;
  tarot_world_pos_current: string;
  tarot_world_pos_challenge: string;
  tarot_world_pos_opportunity: string;
  tarot_world_pos_dilemma: string;
  tarot_world_pos_hidden: string;
  tarot_world_pos_right_path: string;
  tarot_world_pos_message: string;
  tarot_world_locked: string;
  tarot_world_spread_question_name: string;
  tarot_world_spread_question_desc: string;
  tarot_world_pos_hidden_influence: string;
  tarot_world_pos_current_energy: string;
  tarot_world_pos_possible_direction: string;
  tarot_question_title: string;
  tarot_question_desc: string;
  tarot_question_label: string;
  tarot_question_placeholder: string;
  tarot_question_cta: string;
  // Daily Card Modal
  daily_title: string;
  daily_desc: string;
  daily_note: string;
  daily_name_label: string;
  daily_name_placeholder: string;
  daily_name_greeting: string;
  daily_cta: string;
  daily_shuffle: string;
  daily_shuffle_focus: string;
  daily_card_chosen: string;
  daily_arcana_label: string;
  daily_next_card: string;
  daily_loading: string;
  daily_premium_title: string;
  daily_premium_desc: string;
  daily_premium_cta: string;
  daily_already_drawn: string;
  daily_time_format: string;
  daily_section_summary: string;
  daily_section_love: string;
  daily_section_career: string;
  daily_section_advice: string;
  daily_section_keywords: string;
  daily_advisor_cta_text: string;

  // Palm Reading Modal
  palm_title: string;
  palm_desc: string;
  palm_name_label: string;
  palm_name_placeholder: string;
  palm_right_label: string;
  palm_left_label: string;
  palm_uploaded: string;
  palm_upload_click: string;
  palm_capture: string;
  palm_gallery: string;
  palm_tips_title: string;
  palm_tip1: string;
  palm_tip2: string;
  palm_tip3: string;
  palm_tip4: string;
  palm_cta: string;
  palm_note: string;
  palm_loading: string;
  palm_result_subtitle: string;
  palm_upload_error: string;
  palm_size_error: string;
  palm_both_required: string;

  // Share Section
  share_title: string;
  share_subtitle: string;
  share_whatsapp: string;
  share_instagram: string;
  share_facebook: string;
  share_copy: string;
  share_copied: string;
  share_instagram_toast: string;
  share_copy_toast: string;

  // Onboarding
  onboarding_step1_title: string;
  onboarding_step1_text: string;
  onboarding_step1_cta: string;
  onboarding_step2_title: string;
  onboarding_step2_text: string;
  onboarding_step2_cta: string;
  onboarding_step3_title: string;
  onboarding_step3_text: string;
  onboarding_step3_cta: string;
  onboarding_skip: string;

  // Lead Form Modal
  lead_modal_title: string;
  lead_modal_subtitle: string;
  lead_modal_close: string;
  lead_modal_interest_personal: string;
  lead_modal_interest_couple: string;
  lead_modal_interest_full: string;
  lead_modal_interest_tarot: string;
  lead_modal_interest_palm: string;

  // Palm Coming Soon
  palm_coming_soon_title: string;
  palm_coming_soon_desc: string;
  palm_coming_soon_subscribed: string;
  palm_coming_soon_notify: string;
  palm_coming_soon_close: string;

  // WhatsApp
  whatsapp_aria: string;

  // 404
  not_found_title: string;
  not_found_text: string;
  not_found_cta: string;

  // Birth Chart
  birth_chart_title: string;
  birth_chart_desc: string;
  birth_chart_date_label: string;
  birth_chart_time_label: string;
  birth_chart_city_label: string;
  birth_chart_city_placeholder: string;
  birth_chart_cta: string;
  birth_chart_note: string;
  birth_chart_loading: string;
  birth_chart_sun: string;
  birth_chart_rising: string;
  birth_chart_moon: string;
  birth_chart_error_required: string;
  geocode_empty: string;
  geocode_fetch_failed: string;
  geocode_not_found: string;
  nav_birthchart_title: string;
  nav_birthchart_desc: string;
  nav_birthchart_cta: string;
  birth_chart_save_image: string;
  birth_chart_save_pdf: string;

  // Dashboard
  dashboard_title: string;
  dashboard_subtitle: string;
  dashboard_empty_title: string;
  dashboard_empty_desc: string;
  dashboard_identity: string;
  dashboard_rising: string;
  dashboard_readings: string;
  dashboard_unique_cards: string;
  dashboard_days: string;
  dashboard_recurring_cards: string;
  dashboard_energy_themes: string;
  dashboard_compatibility: string;

  // Common
  common_free: string;
  common_close: string;
  common_loading: string;

  // Tarot Flow UI (shuffle, table, errors)
  tarot_shuffle_title_idle: string;
  tarot_shuffle_title_shuffling: string;
  tarot_shuffle_title_ready: string;
  tarot_shuffle_desc_idle: string;
  tarot_shuffle_desc_shuffling: string;
  tarot_shuffle_desc_ready: string;
  tarot_shuffle_cta: string;
  tarot_shuffle_status: string;
  tarot_shuffle_done: string;
  tarot_step_label: string;
  tarot_step1_desc: string;
  tarot_step2_desc: string;
  tarot_table_title: string;
  tarot_table_hint: string;
  tarot_table_all_revealed: string;
  tarot_fan_title: string;
  tarot_fan_hint: string;
  tarot_fan_done: string;
  tarot_table_progress: string;
  tarot_open_cards_cta: string;
  tarot_error_unexpected: string;
  tarot_error_service: string;
  tarot_error_connection: string;
  tarot_skip_to_reading: string;
  hero_open_full_reading: string;
  hero_tarot_fallback_message: string;

  // Immersive Tarot Experience
  imm_tarot_label: string;
  imm_tarot_question_title: string;
  imm_tarot_choose_cards: string;
  imm_tarot_cards_chosen: string;
  imm_tarot_listen_intuition: string;
  imm_tarot_your_reading: string;
  imm_tarot_deciphering: string;
  imm_tarot_message_revealed: string;
  imm_tarot_cards_speak: string;
  imm_tarot_message_right_moment: string;
  imm_tarot_breathe_message: string;
  imm_tarot_finish: string;
  imm_tarot_category_love: string;
  imm_tarot_category_career: string;
  imm_tarot_category_money: string;
  imm_tarot_category_general: string;

  // Advisor panel
  advisor_quick_questions_label: string;
  advisor_or_type_question: string;
  advisor_share: string;
  advisor_copy: string;
  advisor_copied: string;

  // Daily Ritual
  daily_ritual_label: string;
  daily_ritual_title: string;
  daily_ritual_desc: string;
  daily_ritual_cta: string;
  daily_ritual_click_hint: string;
  daily_ritual_card_label: string;
  daily_ritual_message_label: string;
  daily_ritual_message_quote: string;
  daily_ritual_energy_label: string;
  daily_ritual_done_text: string;
  daily_ritual_next_text: string;

  // Accessibility
  a11y_skip_to_content: string;
  a11y_main_navigation: string;
  a11y_close_modal: string;
  a11y_close_menu: string;
  a11y_open_menu: string;
  a11y_open_oracle: string;
  a11y_close_oracle: string;
  a11y_open_dashboard: string;
  a11y_language_selector: string;
  a11y_change_language: string;
  a11y_whatsapp_contact: string;
  a11y_readings_history: string;
  a11y_delete_reading: string;
  a11y_expand_reading: string;
  a11y_collapse_reading: string;
  a11y_form_required: string;
  a11y_loading_reading: string;
  a11y_reading_complete: string;
  a11y_card_face_down: string;
  a11y_card_revealed: string;
  a11y_score_label: string;
  a11y_countdown_label: string;
  a11y_daily_section: string;
  a11y_hero_section: string;
  a11y_footer_section: string;
  a11y_statement_title: string;
  a11y_statement_intro: string;
  a11y_statement_standards: string;
  a11y_statement_features_title: string;
  a11y_statement_feature_keyboard: string;
  a11y_statement_feature_screen_reader: string;
  a11y_statement_feature_contrast: string;
  a11y_statement_feature_focus: string;
  a11y_statement_feature_motion: string;
  a11y_statement_feature_rtl: string;
  a11y_statement_feature_multilingual: string;
  a11y_statement_contact_title: string;
  a11y_statement_contact_text: string;
  a11y_statement_last_updated: string;
  a11y_link_label: string;
  a11y_no_readings: string;

  // Advisor
  advisor_title: string;
  advisor_placeholder_context: string;
  advisor_placeholder_general: string;
  advisor_welcome_context: string;
  advisor_welcome_general: string;
  advisor_welcome_tarot: string;
  advisor_welcome_astrology: string;
  advisor_welcome_compatibility: string;
  advisor_welcome_palm: string;
  advisor_suggestion_1: string;
  advisor_suggestion_2: string;
  advisor_suggestion_3: string;
  // Tarot suggestions
  advisor_tarot_s1: string;
  advisor_tarot_s2: string;
  advisor_tarot_s3: string;
  advisor_tarot_s4: string;
  // Astrology suggestions
  advisor_astro_s1: string;
  advisor_astro_s2: string;
  advisor_astro_s3: string;
  advisor_astro_s4: string;
  // Compatibility suggestions
  advisor_compat_s1: string;
  advisor_compat_s2: string;
  advisor_compat_s3: string;
  advisor_compat_s4: string;
  // Palm suggestions
  advisor_palm_s1: string;
  advisor_palm_s2: string;
  advisor_palm_s3: string;
  advisor_palm_s4: string;
  advisor_limit_reached: string;
  advisor_upgrade_cta: string;
  advisor_send: string;
  advisor_error: string;
  advisor_open: string;
  advisor_close: string;

  // Premium Upgrade page
  premium_back: string;
  premium_unlock_title: string;
  premium_unlock_desc: string;
  premium_most_popular: string;
  premium_plan_free_name: string;
  premium_plan_free_desc: string;
  premium_plan_sub_name: string;
  premium_plan_sub_desc: string;
  premium_plan_free_cta: string;
  premium_plan_sub_cta: string;
  premium_trust_secure: string;
  premium_trust_instant: string;
  premium_trust_cancel: string;

  // SEO pages
  seo_card_not_found: string;
  seo_sign_not_found: string;
  seo_back_home: string;
  seo_breadcrumb_tarot: string;
  seo_breadcrumb_zodiac: string;
  seo_section_general: string;
  seo_section_love: string;
  seo_section_career: string;
  seo_section_spiritual: string;
  seo_section_advice: string;
  seo_section_personality: string;
  seo_section_money: string;
  seo_section_health: string;
  seo_section_sensual: string;
  seo_tarot_cta_title: string;
  seo_tarot_cta_desc: string;
  seo_tarot_cta_button: string;
  seo_all_tarot_cards: string;
  seo_zodiac_compat_title: string;
  seo_zodiac_compat_desc: string;
  seo_zodiac_tarot_title: string;
  seo_zodiac_tarot_desc: string;
  seo_all_zodiac_signs: string;
  seo_arcana_number: string;

  // Common UI
  free_badge_label: string;
  astrologer_chat_title: string;
  astrologer_chat_desc: string;
  astrologer_chat_label: string;
  astrologer_chat_summary: string;
  astrologer_personal_guidance: string;
  astrologer_aria_label: string;

  // Toast messages
  toast_image_download_success: string;
  toast_image_download_error: string;
  toast_pdf_ready: string;
  toast_pdf_error: string;
  birth_chart_pdf_title: string;

  // Chart UI
  chart_title: string;
  chart_subtitle: string;
  chart_personal_title: string;
  chart_of_name: string;
  chart_computing: string;
  chart_birth_location: string;
  chart_dominance: string;
  chart_key_aspects: string;
  chart_house_cusps: string;
  chart_gravity_center: string;
  chart_full_interp_title: string;
  chart_full_interp_desc: string;
  chart_copied: string;
  chart_copy_interp: string;
  chart_save_image: string;
  chart_asc_horizon: string;
  chart_form_error: string;
  chart_form_loading: string;
  chart_form_note: string;
  chart_daily_available: string;
  chart_daily_limit_reached: string;
  chart_daily_limit_toast: string;

  // Tarot Guide Page
  guide_tarot_hero_title: string;
  guide_tarot_hero_subtitle: string;
  guide_tarot_intro: string;
  guide_tarot_s1_title: string;
  guide_tarot_s1_b1: string;
  guide_tarot_s1_b2: string;
  guide_tarot_s1_b3: string;
  guide_tarot_s2_title: string;
  guide_tarot_s2_b1: string;
  guide_tarot_s2_b2: string;
  guide_tarot_s2_b3: string;
  guide_tarot_s3_title: string;
  guide_tarot_s3_b1: string;
  guide_tarot_s3_b2: string;
  guide_tarot_s3_b3: string;
  guide_tarot_s3_b4: string;
  guide_tarot_s4_title: string;
  guide_tarot_s4_bullet1: string;
  guide_tarot_s4_bullet2: string;
  guide_tarot_s4_bullet3: string;
  guide_tarot_s4_bullet4: string;
  guide_tarot_s4_bullet5: string;
  guide_tarot_cta_text: string;
  guide_tarot_cta_button: string;

  // Payment gating
  gating_upgrade_label: string;
  gating_pay_label: string;
  gating_or_label: string;
  gating_subscribe_label: string;
  gating_cancel_label: string;
  gating_limit_reached: string;
  gating_resets_in: string;
  gating_resets_in_days: string;
  gating_or_pay_now: string;
};
