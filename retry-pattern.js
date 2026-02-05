// retry-pattern.js
// Patrón: Retry (Reintentar)

class RetryExecutor {
  constructor() {
    // 1. Máximo número de intentos
    this.maxAttempts = 3;

    // 2. Tiempo de espera inicial (1 segundo)
    this.initialDelay = 1000; // ms

    // 3. Contador de intentos actual
    this.currentAttempt = 0;

    console.log("✅ Retry Pattern creado. Máximo 3 intentos");
  }

  // Método principal: ejecuta con reintentos automáticos
  async executeWithRetry(operation) {
    let lastError;

    // Intentar hasta maxAttempts veces
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      this.currentAttempt = attempt;
      console.log(`🔄 Intento ${attempt}/${this.maxAttempts}`);

      try {
        // Intentar la operación
        const result = await operation();
        console.log(`✅ Éxito en intento ${attempt}`);
        return result;
      } catch (error) {
        lastError = error;
        console.log(`❌ Fallo en intento ${attempt}: ${error.message}`);

        // Si es el último intento, salir del bucle
        if (attempt === this.maxAttempts) {
          break;
        }

        // Calcular cuánto esperar antes del próximo intento
        const delay = this.calculateDelay(attempt);
        console.log(`⏰ Esperando ${delay}ms antes del próximo intento...`);

        // Esperar (simulando el delay)
        await this.sleep(delay);
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    console.log(`💥 Todos los ${this.maxAttempts} intentos fallaron`);
    throw lastError;
  }

  // Calcular tiempo de espera (Backoff exponencial)
  calculateDelay(attempt) {
    // Fórmula: delay = initialDelay * 2^(attempt-1)
    // Intento 1: 1000ms
    // Intento 2: 2000ms
    // Intento 3: 4000ms
    const delay = this.initialDelay * Math.pow(2, attempt - 1);

    // Añadir un poco de aleatoriedad (Jitter)
    const jitter = delay * 0.2 * Math.random();

    return delay + jitter;
  }

  // Función para esperar (sleep)
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Método para obtener estado
  getStatus() {
    return {
      currentAttempt: this.currentAttempt,
      maxAttempts: this.maxAttempts,
    };
  }
}
