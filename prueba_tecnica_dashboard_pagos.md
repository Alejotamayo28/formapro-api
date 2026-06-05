# Prueba Técnica 2 — Dashboard de Pagos

**Candidato:** Alejandro Vergara Tamayo

## Contexto

Construir un dashboard web conectado a Supabase para visualizar y analizar los pagos almacenados en la base de datos del reto anterior.

## Requerimientos Obligatorios

### Conexión a Supabase
- Leer la tabla de pagos existente.
- Consumir los datos directamente desde Supabase.

### Indicadores Principales
- Ingresos totales (solo pagos `completed`).
- Número total de pagos.
- Número total de reembolsos.
- Ticket promedio.

### Tabla de Pagos (operations.payments)
- id_pago PK TEXT.
- email.
- nombre NOT NULL.
- curso NOT NULL.
- importe NOT NULL.
- moneda NOT NULL.
- estado NOT NULL.
- fecha NOT NULL.
- refunded_at.
- created_at.
- updated_at.

### Gráficos
Incluir al menos un gráfico:
- Pagos por estado.
- Ingresos por moneda.
- Evolución temporal de ingresos.

### Formato de Moneda
- No hardcodear símbolos.
- Soportar COP, USD, EUR y cualquier otra moneda presente.

### Funcionalidad Adicional
Agregar una mejora propia que aporte valor al dashboard.

-- 

## Diseño Propuesto

### Encabezado
- Nombre del dashboard.
- Descripción breve.
- Última actualización.

### KPIs
- Ingresos completados.
- Total pagos.
- Total reembolsos.
- Ticket promedio.

### Visualización
- Gráfico principal de pagos por estado.
- Gráfico secundario opcional de ingresos por moneda.

### Tabla
- Tabla completa de pagos.
- Soporte para filtros y búsqueda.

---

## Extras Recomendados

### Filtros
- Todos.
- Completed.
- Failed.
- Refunded.

### Búsqueda
- Por email.
- Por nombre.
- Por curso.
- Por ID de pago.

### Exportación CSV
- Exportar los datos visibles que se muesrtan en la grafica.

### Alertas
- Reembolsos detectados.

### Resumen por Moneda
Mostrar ingresos separados por moneda para evitar mezclar divisas.

---

## Consideraciones Financieras

No sumar directamente monedas diferentes.

Incorrecto:
- COP + USD + EUR en un único total.

Correcto:
- Totales agrupados por moneda.
- COP → Total ingresos.
- USD → Total ingresos.
- EUR → Total ingresos.

---

## Estrategia de Despliegue (Analizamos despues de terminar front y back en local)

### Plataforma Principal
Vercel (Backend)
Cloudflare pages (Frontend)

- Integración con GitHub.
- Despliegue automático.

### Alternativas
- Cloudflare Pages.

---

## Variables de Entorno

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Buenas prácticas:
- No exponer claves privadas.
- No usar service_role en frontend.

---

## Entregables

### Obligatorios
- Repositorio GitHub.
- Dashboard desplegado en Vercel.

### Recomendados
- README.md.
- Capturas de pantalla.
- Explicación del uso de IA.

---

## Criterios de Calidad

- Diseño limpio.
- Responsividad.
- Manejo de errores.
- Código organizado.
- Componentes reutilizables.
- Datos correctamente formateados.
- Gráficos útiles.
- Documentación clara.

---

## MVP

- Conexión a Supabase.
- KPIs.
- Tabla.
- Gráfico.
- Formato correcto de moneda.
- Deploy en Vercel.

## Versión Mejorada

- Todo el MVP.
- Filtros.
- Búsqueda.
- Exportar CSV.
- Resumen por moneda.
- Alertas visuales.

---

## Recomendación Final

Priorizar simplicidad, claridad y calidad de ejecución.

Stack final recomendado:

- Backend:
  TypeScript
  TSOA (Documentacion y Validaciones)

- Frontend 
  React
  Vite
  Tailwind

- Base de datso:
  Supabase

Extras recomendados:

- Filtros
- Búsqueda
- Exportar CSV
- Resumen por moneda
