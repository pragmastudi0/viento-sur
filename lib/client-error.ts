export function clientError(error: unknown) {
  if (error instanceof TypeError) return 'Revisá tu conexión e intentá nuevamente. Tus cambios siguen en el formulario.';
  if (error instanceof SyntaxError) return 'El servicio no respondió correctamente. Esperá un momento e intentá nuevamente.';
  return error instanceof Error ? error.message : 'No pudimos completar la operación. Intentá nuevamente.';
}
