export class SuccessResponse {
  constructor(message, data, success, total_data, additional_data = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.total_data = total_data;
    this.additional_data = additional_data;
  }
}
