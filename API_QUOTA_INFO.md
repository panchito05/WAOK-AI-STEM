# Información sobre Cuota de API de Gemini

## Error Actual
```
[429 Too Many Requests] You exceeded your current quota
quotaValue: 200 (Free Tier)
```

## Límites del Plan Gratuito
- **200 solicitudes por día** por proyecto/modelo
- Modelo: gemini-2.0-flash

## Optimizaciones Implementadas

1. **Reducción de reintentos**: De 3 a 1 intento
2. **Delay entre niveles**: 1 segundo entre generaciones
3. **Detección de cuota**: Si se detecta error 429, se detiene la generación
4. **Prompt genérico**: Reducido para consumir menos tokens

## Recomendaciones

### Desarrollo
1. Usar API key con plan de pago
2. Implementar caché de ejercicios generados
3. Generar ejemplos por nivel individualmente (no todos a la vez)

### Producción
1. Configurar API key del usuario en Netlify
2. Implementar rate limiting en el frontend
3. Mostrar mensaje amigable cuando se alcance el límite

## Configuración de API Key
En `.env.local`:
```
GEMINI_API_KEY=tu_api_key_aqui
```

En Netlify:
Configurar variable de entorno `GEMINI_API_KEY` con una key de plan de pago.