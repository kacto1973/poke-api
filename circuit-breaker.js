// circuit-breaker.js
// Patrón: Circuit Breaker (Cortacircuitos)

class CircuitBreaker {
  constructor() {
    // 1. Definir los 3 estados posibles
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN

    // 2. Contador de fallos consecutivos
    this.failureCount = 0;

    // 3. Límite máximo de fallos antes de abrir
    this.failureThreshold = 3;

    // 4. Tiempo de espera antes de reintentar (10 segundos)
    this.resetTimeout = 10000; // ms

    // 5. Cuándo fue el último fallo
    this.lastFailureTime = null;

    console.log("✅ Circuit Breaker creado. Estado inicial: CLOSED");
  }

  // Método principal: ejecuta una operación con protección
  async execute(operation) {
    console.log(`📊 Circuit Breaker estado: ${this.state}`);

    // CASO 1: Si está ABIERTO, verificar si ya pasó el tiempo de espera
    if (this.state === "OPEN") {
      const now = Date.now();
      const timeSinceLastFailure = now - this.lastFailureTime;

      // ¿Ya pasaron 10 segundos desde el último fallo?
      if (timeSinceLastFailure > this.resetTimeout) {
        console.log("⏰ Tiempo de espera cumplido. Cambiando a HALF_OPEN");
        this.state = "HALF_OPEN"; // Cambiar a modo prueba
      } else {
        // Todavía no ha pasado el tiempo, rechazar inmediatamente
        const secondsLeft = Math.ceil(
          (this.resetTimeout - timeSinceLastFailure) / 1000,
        );
        throw new Error(
          `🚫 Circuit Breaker ABIERTO. Reintentar en ${secondsLeft} segundos`,
        );
      }
    }

    try {
      // Intentar ejecutar la operación (ej: llamada a API)
      const result = await operation();

      // Si tiene éxito
      this.onSuccess();
      return result;
    } catch (error) {
      // Si falla
      this.onFailure();
      throw error; // Re-lanzar el error
    }
  }

  // Cuando una operación tiene éxito
  onSuccess() {
    console.log("✅ Operación exitosa");

    // Reiniciar contador de fallos
    this.failureCount = 0;

    // Si estaba en HALF_OPEN, cambiar a CLOSED
    if (this.state === "HALF_OPEN") {
      console.log("🔓 Circuit Breaker cambiando a CLOSED (recuperado)");
      this.state = "CLOSED";
    }
  }

  // Cuando una operación falla
  onFailure() {
    console.log("❌ Operación fallida");

    // Incrementar contador de fallos
    this.failureCount++;

    // Guardar cuándo fue este fallo
    this.lastFailureTime = Date.now();

    // Si llegamos al límite de fallos, ABRIR el circuito
    if (this.failureCount >= this.failureThreshold) {
      console.log(
        `🚨 Circuit Breaker ABIERTO por ${this.failureCount} fallos consecutivos`,
      );
      this.state = "OPEN";
    }
  }

  // Método para obtener estado actual
  getStatus() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      timeUntilRetry:
        this.state === "OPEN"
          ? Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime))
          : 0,
    };
  }
}
