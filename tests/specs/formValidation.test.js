const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const TestUtils = require('../helpers/testUtils');

describe('Registration Form - Validation & Edge Cases', function() {
  let testUtils;

  this.timeout(60000);

  beforeEach(async function() {
    testUtils = new TestUtils();
    await testUtils.setupDriver();
    await testUtils.navigateToForm();
  });

  afterEach(async function() {
    if (this.currentTest.state === 'failed') {
      await testUtils.takeScreenshot(`failed-${this.currentTest.title.replace(/\s+/g, '-')}`);
    }
    await testUtils.tearDown();
  });

  describe('Required Field Validation', function() {
    it('should show validation errors for empty required fields', async function() {
      // Submit empty form
      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      // Check for form-level errors
      const errors = await testUtils.getErrorMessages();
      expect(errors.length).to.be.greaterThan(0);

      // Should have field errors for required fields
      const fieldErrors = errors.filter(e => e.type === 'field');
      expect(fieldErrors.length).to.be.greaterThan(0);

      // Verify no success message
      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.be.null;
    });

    it('should show specific error for unchecked consent', async function() {
      // Fill all fields except consent
      await testUtils.fillValidParticipantData(1);
      await testUtils.fillValidParticipantData(2);
      // Don't check consent checkbox

      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      const errors = await testUtils.getErrorMessages();
      const consentError = errors.find(e =>
        e.message.toLowerCase().includes('consent') ||
        e.message.toLowerCase().includes('agree')
      );
      expect(consentError).to.not.be.undefined;
    });

    it('should validate individual required fields on blur', async function() {
      // Test first name validation
      const firstNameField = await testUtils.driver.findElement(By.id('firstName1'));
      await firstNameField.click();
      await firstNameField.sendKeys('Test');
      await firstNameField.clear(); // Clear the field

      // Click away to trigger blur
      const lastNameField = await testUtils.driver.findElement(By.id('lastName1'));
      await lastNameField.click();

      await testUtils.driver.sleep(1000);

      // Should show field error
      const errors = await testUtils.getErrorMessages();
      expect(errors.length).to.be.greaterThan(0);
    });
  });

  describe('Email Validation', function() {
    it('should reject invalid email formats', async function() {
      const invalidEmails = TestUtils.getInvalidTestData().invalidEmails;

      for (const email of invalidEmails.slice(0, 3)) { // Test first 3
        // Clear any previous errors
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);

        // Fill valid data except email
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillField('email1', email);

        // Trigger validation by clicking away
        const lastNameField = await testUtils.driver.findElement(By.id('lastName1'));
        await lastNameField.click();

        await testUtils.driver.sleep(1000);

        const errors = await testUtils.getErrorMessages();
        const emailError = errors.find(e =>
          e.message.toLowerCase().includes('email') ||
          e.message.toLowerCase().includes('valid')
        );
        expect(emailError).to.not.be.undefined;
      }
    });

    it('should show real-time email validation on blur', async function() {
      const emailField = await testUtils.driver.findElement(By.id('email1'));
      await emailField.click();
      await emailField.sendKeys('invalid-email');

      // Trigger blur
      const nameField = await testUtils.driver.findElement(By.id('firstName1'));
      await nameField.click();

      await testUtils.driver.sleep(1000);

      const errors = await testUtils.getErrorMessages();
      const emailError = errors.find(e =>
        e.message.toLowerCase().includes('email')
      );
      expect(emailError).to.not.be.undefined;
    });
  });

  describe('Phone Number Validation', function() {
    it('should reject invalid phone number formats', async function() {
      const invalidPhones = TestUtils.getInvalidTestData().invalidPhones;

      for (const phone of invalidPhones.slice(0, 3)) { // Test first 3
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);

        // Fill valid data except phone
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillField('phone1', phone);

        // Trigger validation
        const emailField = await testUtils.driver.findElement(By.id('email1'));
        await emailField.click();

        await testUtils.driver.sleep(1000);

        const errors = await testUtils.getErrorMessages();
        const phoneError = errors.find(e =>
          e.message.toLowerCase().includes('phone') ||
          e.message.includes('+971')
        );
        expect(phoneError).to.not.be.undefined;
      }
    });

    it('should enforce UAE phone number format', async function() {
      const phoneField = await testUtils.driver.findElement(By.id('phone1'));
      await phoneField.clear();
      await phoneField.sendKeys('+1234567890'); // Non-UAE number

      // Trigger blur
      const emailField = await testUtils.driver.findElement(By.id('email1'));
      await emailField.click();

      await testUtils.driver.sleep(1000);

      const errors = await testUtils.getErrorMessages();
      const phoneError = errors.find(e =>
        e.message.includes('+971') ||
        e.message.toLowerCase().includes('format')
      );
      expect(phoneError).to.not.be.undefined;
    });
  });

  describe('Emirates ID Validation', function() {
    it('should reject invalid Emirates ID formats', async function() {
      const invalidIds = TestUtils.getInvalidTestData().invalidEmiratesIds;

      for (const id of invalidIds.slice(0, 3)) { // Test first 3
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);

        // Fill valid data except Emirates ID
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillField('emiratesId1', id);

        // Trigger validation
        const phoneField = await testUtils.driver.findElement(By.id('phone1'));
        await phoneField.click();

        await testUtils.driver.sleep(1000);

        const errors = await testUtils.getErrorMessages();
        const idError = errors.find(e =>
          e.message.toLowerCase().includes('emirates') ||
          e.message.includes('15 digits')
        );
        expect(idError).to.not.be.undefined;
      }
    });

    it('should require exactly 15 digits for Emirates ID', async function() {
      const testCases = [
        '12345', // Too short
        '784200812345678901', // Too long
        'abcd123456789ef' // Contains letters
      ];

      for (const testCase of testCases) {
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);

        const emiratesIdField = await testUtils.driver.findElement(By.id('emiratesId1'));
        await emiratesIdField.clear();
        await emiratesIdField.sendKeys(testCase);

        // Trigger blur
        const phoneField = await testUtils.driver.findElement(By.id('phone1'));
        await phoneField.click();

        await testUtils.driver.sleep(1000);

        const errors = await testUtils.getErrorMessages();
        const idError = errors.find(e =>
          e.message.includes('15 digits') ||
          e.message.toLowerCase().includes('emirates')
        );
        expect(idError).to.not.be.undefined;
      }
    });
  });

  describe('Date of Birth Validation', function() {
    it('should reject dates outside allowed range', async function() {
      const invalidDates = [
        '2005-01-01', // Too early
        '2015-12-31', // Too late
        '2006-12-31', // Still too early
        '2013-01-01'  // Still too late
      ];

      for (const date of invalidDates) {
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);

        const dobField = await testUtils.driver.findElement(By.id('dob1'));
        await dobField.clear();
        await dobField.sendKeys(date);

        // Trigger blur/change
        const nameField = await testUtils.driver.findElement(By.id('firstName1'));
        await nameField.click();

        await testUtils.driver.sleep(1000);

        const errors = await testUtils.getErrorMessages();
        const dateError = errors.find(e =>
          e.message.toLowerCase().includes('date') ||
          e.message.includes('2007') ||
          e.message.includes('2012')
        );
        expect(dateError).to.not.be.undefined;
      }
    });

    it('should show specific error messages for date boundaries', async function() {
      // Test too early date
      const dobField = await testUtils.driver.findElement(By.id('dob1'));
      await dobField.clear();
      await dobField.sendKeys('2005-01-01');

      const nameField = await testUtils.driver.findElement(By.id('firstName1'));
      await nameField.click();

      await testUtils.driver.sleep(1000);

      let errors = await testUtils.getErrorMessages();
      let dateError = errors.find(e =>
        e.message.includes('January 1, 2007') ||
        e.message.includes('2007')
      );
      expect(dateError).to.not.be.undefined;

      // Test too late date
      await dobField.clear();
      await dobField.sendKeys('2015-12-31');
      await nameField.click();

      await testUtils.driver.sleep(1000);

      errors = await testUtils.getErrorMessages();
      dateError = errors.find(e =>
        e.message.includes('December 31, 2012') ||
        e.message.includes('2012')
      );
      expect(dateError).to.not.be.undefined;
    });
  });

  describe('Form Interaction Edge Cases', function() {
    it('should handle rapid form submission attempts', async function() {
      // Fill valid form
      await testUtils.fillValidFormData();

      // Submit multiple times rapidly
      const submitButton = await testUtils.driver.findElement(By.css('button[type="submit"]'));
      await submitButton.click();
      await submitButton.click(); // Second click should be ignored

      await testUtils.driver.sleep(3000);

      // Should still show success message
      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.not.be.null;
    });

    it('should maintain form state during validation', async function() {
      // Fill partial form
      await testUtils.fillField('firstName1', 'TestName');
      await testUtils.fillField('email1', 'test@example.com');

      // Submit to trigger validation
      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      // Check that filled fields retain their values
      const firstNameValue = await testUtils.driver.findElement(By.id('firstName1')).getAttribute('value');
      const emailValue = await testUtils.driver.findElement(By.id('email1')).getAttribute('value');

      expect(firstNameValue).to.equal('TestName');
      expect(emailValue).to.equal('test@example.com');
    });

    it('should clear errors when valid data is entered after validation failure', async function() {
      // Submit empty form to get errors
      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      let errors = await testUtils.getErrorMessages();
      expect(errors.length).to.be.greaterThan(0);

      // Fill all required fields
      await testUtils.fillValidFormData();
      await testUtils.driver.sleep(1000);

      // Submit again
      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      // Should now succeed
      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.not.be.null;
    });

    it('should handle browser navigation and form reset', async function() {
      // Fill some data
      await testUtils.fillField('firstName1', 'TestName');
      await testUtils.fillField('email1', 'test@example.com');

      // Refresh page
      await testUtils.driver.navigate().refresh();
      await testUtils.driver.sleep(2000);

      // Form should be reset
      const firstNameValue = await testUtils.driver.findElement(By.id('firstName1')).getAttribute('value');
      const emailValue = await testUtils.driver.findElement(By.id('email1')).getAttribute('value');

      expect(firstNameValue).to.equal('');
      expect(emailValue).to.equal('');
    });
  });

  describe('Accessibility and UX Edge Cases', function() {
    it('should focus on first invalid field after validation failure', async function() {
      // Submit empty form
      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      // Check which element has focus (should be first invalid field)
      const activeElement = await testUtils.driver.switchTo().activeElement();
      const activeElementId = await activeElement.getAttribute('id');

      // Should focus on one of the required fields
      const expectedFields = ['firstName1', 'lastName1', 'email1', 'dob1', 'phone1', 'emiratesId1', 'school1'];
      expect(expectedFields).to.include(activeElementId);
    });

    it('should handle keyboard navigation for form submission', async function() {
      // Fill valid form
      await testUtils.fillValidFormData();

      // Navigate to submit button using Tab and press Enter
      const submitButton = await testUtils.driver.findElement(By.css('button[type="submit"]'));
      await submitButton.sendKeys('\n'); // Enter key

      await testUtils.driver.sleep(2000);

      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.not.be.null;
    });
  });
});
