export function formatMessageDateTime(date) {
  return new Date(date).toLocaleString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
