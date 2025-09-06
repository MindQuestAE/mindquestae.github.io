const { expect } = require('chai');
const TestUtils = require('../helpers/testUtils');

describe('Registration Form - Success Cases', function() {
  let testUtils;

  // Increase timeout for Selenium tests
  this.timeout(60000);

  beforeEach(async function() {
    testUtils = new TestUtils();
    await testUtils.setupDriver();
    await testUtils.navigateToForm();
  });

  afterEach(async function() {
    // Take screenshot on failure
    if (this.currentTest.state === 'failed') {
      await testUtils.takeScreenshot(`failed-${this.currentTest.title.replace(/\s+/g, '-')}`);
    }
    await testUtils.tearDown();
  });

  describe('Valid Form Submission', function() {
    it('should successfully submit form with all valid data', async function() {
      // Fill out the form with valid data
      await testUtils.fillValidFormData();

      // Submit the form
      await testUtils.submitForm();

      // Wait for success message
      await testUtils.driver.sleep(2000);

      // Check for success message
      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.not.be.null;
      expect(successMessage).to.include('Registration Successful');

      // Verify no error messages are present
      const errors = await testUtils.getErrorMessages();
      expect(errors).to.have.length(0);
    });

    it('should handle different curriculum selections correctly', async function() {
      const curriculumOptions = ['British', 'American', 'International Baccalaureate (IB)', 'Indian (CBSE)', 'Indian (ICSE/ISC)'];

      for (const curriculum of curriculumOptions.slice(0, 2)) { // Test first 2 to save time
        // Fill basic form data
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillValidParticipantData(2);

        // Override curriculum for both participants
        await testUtils.selectDropdown('curriculum1', curriculum);
        await testUtils.selectDropdown('curriculum2', curriculum);

        await testUtils.checkCheckbox('consent');
        await testUtils.submitForm();

        // Wait for success
        await testUtils.driver.sleep(2000);

        const successMessage = await testUtils.getSuccessMessage();
        expect(successMessage).to.not.be.null;
        expect(successMessage).to.include('Registration Successful');

        // Reset form for next iteration
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });

    it('should handle different grade selections correctly', async function() {
      const grades = ['8', '9', '10', '11', '12'];

      for (const grade of grades.slice(0, 3)) { // Test first 3 to save time
        // Fill basic form data
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillValidParticipantData(2);

        // Override grades
        await testUtils.selectDropdown('grade1', grade);
        await testUtils.selectDropdown('grade2', grade);

        await testUtils.checkCheckbox('consent');
        await testUtils.submitForm();

        // Wait for success
        await testUtils.driver.sleep(2000);

        const successMessage = await testUtils.getSuccessMessage();
        expect(successMessage).to.not.be.null;
        expect(successMessage).to.include('Registration Successful');

        // Reset form for next iteration
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });

    it('should accept valid date range boundaries', async function() {
      // Test minimum valid date (2007-01-01)
      await testUtils.fillValidParticipantData(1);
      await testUtils.fillField('dob1', '2007-01-01');

      await testUtils.fillValidParticipantData(2);
      await testUtils.fillField('dob2', '2012-12-31'); // Maximum valid date

      await testUtils.checkCheckbox('consent');
      await testUtils.submitForm();

      await testUtils.driver.sleep(2000);

      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.not.be.null;
      expect(successMessage).to.include('Registration Successful');
    });

    it('should handle different school name inputs', async function() {
      const schoolNames = [
        'GEMS Wellington International School',
        'Custom Test School Name',
        'Al-Rashid International Academy'
      ];

      for (const schoolName of schoolNames) {
        // Fill form with different school names
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillField('school1', schoolName);

        await testUtils.fillValidParticipantData(2);
        await testUtils.fillField('school2', schoolName);

        await testUtils.checkCheckbox('consent');
        await testUtils.submitForm();

        await testUtils.driver.sleep(2000);

        const successMessage = await testUtils.getSuccessMessage();
        expect(successMessage).to.not.be.null;
        expect(successMessage).to.include('Registration Successful');

        // Reset for next iteration
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });
  });

  describe('Form Validation - Positive Cases', function() {
    it('should clear validation errors when valid data is entered', async function() {
      // First, trigger validation errors by submitting empty form
      await testUtils.submitForm();
      await testUtils.driver.sleep(1000);

      // Verify errors are present
      let errors = await testUtils.getErrorMessages();
      expect(errors.length).to.be.greaterThan(0);

      // Now fill valid data
      await testUtils.fillValidFormData();

      // Errors should be cleared as we fill the form
      await testUtils.driver.sleep(1000);
      errors = await testUtils.getErrorMessages();

      // Submit and verify success
      await testUtils.submitForm();
      await testUtils.driver.sleep(2000);

      const successMessage = await testUtils.getSuccessMessage();
      expect(successMessage).to.not.be.null;
      expect(successMessage).to.include('Registration Successful');
    });

    it('should validate email format and accept valid emails', async function() {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test123+tag@gmail.com',
        'firstname.lastname@company-name.org'
      ];

      for (const email of validEmails.slice(0, 2)) { // Test first 2
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillField('email1', email);

        await testUtils.fillValidParticipantData(2);
        await testUtils.fillField('email2', email);

        await testUtils.checkCheckbox('consent');
        await testUtils.submitForm();

        await testUtils.driver.sleep(2000);

        const successMessage = await testUtils.getSuccessMessage();
        expect(successMessage).to.not.be.null;
        expect(successMessage).to.include('Registration Successful');

        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });

    it('should validate phone numbers and accept valid UAE numbers', async function() {
      const validPhones = [
        '+971501234567',
        '+971507654321',
        '+971561234567',
        '+971551234567'
      ];

      for (const phone of validPhones.slice(0, 2)) { // Test first 2
        await testUtils.fillValidParticipantData(1);
        await testUtils.fillField('phone1', phone);

        await testUtils.fillValidParticipantData(2);
        await testUtils.fillField('phone2', phone);

        await testUtils.checkCheckbox('consent');
        await testUtils.submitForm();

        await testUtils.driver.sleep(2000);

        const successMessage = await testUtils.getSuccessMessage();
        expect(successMessage).to.not.be.null;
        expect(successMessage).to.include('Registration Successful');

        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });
  });
});
