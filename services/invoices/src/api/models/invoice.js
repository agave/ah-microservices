const Invoice = {
  instanceMethods: {
    summary() {
      const { id, provider_id, investor_id, amount, status, created_at, updated_at } = this;

      const summary = {
        id: String(id),
        provider_id: String(provider_id),
        amount,
        status,
        created_at: created_at.toString(),
        updated_at: updated_at.toString()
      };

      if (investor_id) {
        summary.investor_id = String(investor_id);
      }

      return summary;
    }
  },
  classMethods: {
  }
};

module.exports = Invoice;
