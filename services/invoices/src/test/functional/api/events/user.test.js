const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sandbox = sinon.sandbox.create();
const helper = require('../../helpers/consumers/user');
const validate = require('../../../common/helpers/validate');

const invoiceFixtures = require('../../fixtures/invoice');

const invoiceUpdatedSchema = require('../../../common/schemas/events/invoice-updated');
const reservationNotFoundSchema = require('../../../common/schemas/events/reservation-not-found');

chai.should();
chai.use(chaiAsPromised);

describe('functional/User consumer', () => {

  before(() => helper.setup());

  after(() => helper.teardown());

  afterEach(() => sandbox.restore());

  describe('balanceReserved', () => {
    it('should produce "ReservationNotFound" if invoice is not found', () => {
      const invalidInvoice = invoiceFixtures.invalidInvoice();

      return helper
        .produceBalanceReservedEvent(invalidInvoice)
        .then(() => helper.getNextEvent())
        .then(validate(reservationNotFoundSchema));
    });

    it('should produce "ReservationNotFound" if invoice is not in "pending_fund" status', () => {
      const invoice = invoiceFixtures.validInvoice();

      invoice.status = 'new';

      return helper
        .updateInvoice(invoice)
        .then(() => helper.produceBalanceReservedEvent(invoice))
        .then(() => helper.getNextEvent())
        .then(validate(reservationNotFoundSchema));
    });

    it('should produce "InvoiceFunded" if invoice exists and is in "pending_fund" status', () => {
      const invoice = invoiceFixtures.validInvoice();

      invoice.status = 'pending_fund';

      return helper
        .updateInvoice(invoice)
        .then(() => helper.produceBalanceReservedEvent(invoice))
        .then(() => helper.getNextEvent())
        .then(validate(invoiceUpdatedSchema))
        .then(i => i.value.body.status.should.be.equal('funded'));
    });
  });

  describe('insufficientBalance', () => {
    it('should produce "ReservationNotFound" if invoice is not found', () => {
      const invalidInvoice = invoiceFixtures.invalidInvoice();

      return helper
        .produceInsufficientBalanceEvent(invalidInvoice)
        .then(() => helper.getNextEvent())
        .then(validate(reservationNotFoundSchema));
    });

    it('should produce "ReservationNotFound" if invoice is not in "pending_fund" status', () => {
      const invoice = invoiceFixtures.validInvoice();

      invoice.status = 'new';

      return helper
        .updateInvoice(invoice)
        .then(() => helper.produceInsufficientBalanceEvent(invoice))
        .then(() => helper.getNextEvent())
        .then(validate(reservationNotFoundSchema));
    });

    it('should update invoice status to "new"', () => {
      const invoice = invoiceFixtures.validInvoice();

      invoice.status = 'pending_fund';

      return helper
        .updateInvoice(invoice)
        .then(() => helper.produceInsufficientBalanceEvent(invoice))
        .then(() => helper.getNextEvent())
        .then(validate(invoiceUpdatedSchema))
        .then(i => i.value.body.status.should.be.equal('new'));
    });
  });

  describe('funderNotFound', () => {
    it('should produce "ReservationNotFound" if invoice is not found', () => {
      const invalidInvoice = invoiceFixtures.invalidInvoice();

      return helper
        .produceFunderNotFoundEvent(invalidInvoice)
        .then(() => helper.getNextEvent())
        .then(validate(reservationNotFoundSchema));
    });

    it('should produce "ReservationNotFound" if invoice is not in "pending_fund" status', () => {
      const invoice = invoiceFixtures.validInvoice();

      invoice.status = 'new';

      return helper
        .updateInvoice(invoice)
        .then(() => helper.produceFunderNotFoundEvent(invoice))
        .then(() => helper.getNextEvent())
        .then(validate(reservationNotFoundSchema));
    });

    it('should update invoice status to "new"', () => {
      const invoice = invoiceFixtures.validInvoice();

      invoice.status = 'pending_fund';

      return helper
        .updateInvoice(invoice)
        .then(() => helper.produceFunderNotFoundEvent(invoice))
        .then(() => helper.getNextEvent())
        .then(validate(invoiceUpdatedSchema))
        .then(i => i.value.body.status.should.be.equal('new'));
    });
  });
});
