interface Date {
  getLocal(): Date;
}

Date.prototype.getLocal = function(): Date {
  this.setHours(this.getHours() - this.getTimezoneOffset() / 60)
  return this;
}