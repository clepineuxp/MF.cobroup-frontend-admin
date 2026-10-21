# ADR-002 — Sesión OIDC de la PWA administrativa

Estado: aceptada para fase 2.

La aplicación inicia una sesión de autoridad protegida con antiforgery y completa Authorization Code + PKCE como cliente público `cobroup-admin-spa`. Access y refresh tokens permanecen únicamente en memoria; el refresh se rota y el logout lo revoca. La ruta administrativa inicial queda protegida por guard y el contexto se obtiene desde la autoridad validando `organization_id`.
