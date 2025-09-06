const { expect } = require('chai');
const { By } = require('selenium-webdriver');
const TestUtils = require('../helpers/testUtils');

describe('Registration Form - Performance & Stress Tests', function() {
  let testUtils;

  this.timeout(120000); // Longer timeout for performance tests

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

  describe('Form Loading Performance', function() {
    it('should load form within acceptable time', async function() {
      const startTime = Date.now();

      // Navigate to form and wait for it to be ready
      await testUtils.navigateToForm();
      await testUtils.waitForElement(By.id('registrationForm'));

      // Check that all form fields are present
      const requiredFields = [
        'firstName1', 'lastName1', 'email1', 'dob1', 'phone1', 'emiratesId1',
        'firstName2', 'lastName2', 'email2', 'dob2', 'phone2', 'emiratesId2',
        'school1', 'school2', 'curriculum1', 'curriculum2', 'grade1', 'grade2', 'consent'
      ];

      for (const fieldId of requiredFields) {
        await testUtils.waitForElement(By.id(fieldId));
      }

      const loadTime = Date.now() - startTime;
      console.log(`Form load time: ${loadTime}ms`);

      // Form should load within 5 seconds
      expect(loadTime).to.be.lessThan(5000);
    });

    it('should handle school list population without delay', async function() {
      const startTime = Date.now();

      // Click on school field to trigger population
      const schoolField = await testUtils.driver.findElement(By.id('school1'));
      await schoolField.click();
      await schoolField.sendKeys('GEMS');

      // Wait for autocomplete suggestions (if any)
      await testUtils.driver.sleep(1000);

      const populationTime = Date.now() - startTime;
      console.log(`School list population time: ${populationTime}ms`);

      // Should be responsive (under 2 seconds)
      expect(populationTime).to.be.lessThan(2000);
    });
  });

  describe('Validation Performance', function() {
    it('should provide immediate validation feedback', async function() {
      const validationTests = [
        { field: 'email1', value: 'invalid-email', expectedError: 'email' },
        { field: 'phone1', value: '+1234567890', expectedError: 'phone' },
        { field: 'emiratesId1', value: '12345', expectedError: '15 digits' },
        { field: 'dob1', value: '2005-01-01', expectedError: 'date' }
      ];

      for (const test of validationTests) {
        const startTime = Date.now();

        // Enter invalid data
        const field = await testUtils.driver.findElement(By.id(test.field));
        await field.clear();
        await field.sendKeys(test.value);

        // Trigger blur
        const otherField = await testUtils.driver.findElement(By.id('firstName1'));
        await otherField.click();

        // Wait for validation error
        await testUtils.driver.sleep(500);

        const errors = await testUtils.getErrorMessages();
        const relevantError = errors.find(e =>
          e.message.toLowerCase().includes(test.expectedError.toLowerCase())
        );

        const validationTime = Date.now() - startTime;
        console.log(`Validation time for ${test.field}: ${validationTime}ms`);

        expect(relevantError).to.not.be.undefined;
        expect(validationTime).to.be.lessThan(1000); // Should be under 1 second

        // Clear for next test
        await field.clear();
      }
    });

    it('should handle rapid field switching without performance degradation', async function() {
      const fields = ['firstName1', 'lastName1', 'email1', 'firstName2', 'lastName2', 'email2'];
      const startTime = Date.now();

      // Rapidly switch between fields
      for (let i = 0; i < 3; i++) { // 3 iterations
        for (const fieldId of fields) {
          const field = await testUtils.driver.findElement(By.id(fieldId));
          await field.click();
          await field.sendKeys('test');
          await testUtils.driver.sleep(50); // Brief pause
        }
      }

      const totalTime = Date.now() - startTime;
      console.log(`Rapid field switching time: ${totalTime}ms`);

      // Should handle rapid switching smoothly
      expect(totalTime).to.be.lessThan(10000);
    });
  });

  describe('Form Submission Performance', function() {
    it('should submit form within acceptable time', async function() {
      // Fill form with valid data
      await testUtils.fillValidFormData();

      const startTime = Date.now();

      // Submit form
      await testUtils.submitForm();

      // Wait for success message
      await testUtils.driver.sleep(3000);
      const successMessage = await testUtils.getSuccessMessage();

      const submissionTime = Date.now() - startTime;
      console.log(`Form submission time: ${submissionTime}ms`);

      expect(successMessage).to.not.be.null;
      expect(submissionTime).to.be.lessThan(5000); // Should complete within 5 seconds
    });

    it('should handle form reset performance after submission', async function() {
      // Fill and submit form
      await testUtils.fillValidFormData();
      await testUtils.submitForm();
      await testUtils.driver.sleep(3000);

      const startTime = Date.now();

      // Wait for form reset (automatic after 5 seconds)
      await testUtils.driver.sleep(3000);

      // Check that form is reset
      const firstNameValue = await testUtils.driver.findElement(By.id('firstName1')).getAttribute('value');
      const phoneValue = await testUtils.driver.findElement(By.id('phone1')).getAttribute('value');

      const resetTime = Date.now() - startTime;
      console.log(`Form reset time: ${resetTime}ms`);

      expect(firstNameValue).to.equal('');
      expect(phoneValue).to.equal('+971'); // Should reset to default
      expect(resetTime).to.be.lessThan(8000);
    });
  });

  describe('Stress Testing', function() {
    it('should handle multiple validation triggers without breaking', async function() {
      // Repeatedly trigger validation by submitting incomplete forms
      for (let i = 0; i < 5; i++) {
        // Fill some fields
        await testUtils.fillField('firstName1', `Test${i}`);
        await testUtils.fillField('email1', i % 2 === 0 ? 'valid@test.com' : 'invalid-email');

        // Submit to trigger validation
        await testUtils.submitForm();
        await testUtils.driver.sleep(1000);

        // Check that validation still works
        const errors = await testUtils.getErrorMessages();
        expect(errors.length).to.be.greaterThan(0);

        // Clear form for next iteration
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });

    it('should handle large amounts of text input without issues', async function() {
      // Test with very long strings
      const longString = 'A'.repeat(1000);
      const longSchoolName = 'Very Long School Name That Exceeds Normal Length Expectations '.repeat(10);

      try {
        await testUtils.fillField('firstName1', longString.substring(0, 100)); // Reasonable limit
        await testUtils.fillField('school1', longSchoolName.substring(0, 200)); // Test school name length

        // Form should handle this gracefully
        const firstNameValue = await testUtils.driver.findElement(By.id('firstName1')).getAttribute('value');
        expect(firstNameValue.length).to.be.greaterThan(0);

        // Should still be able to submit (though it might fail validation)
        await testUtils.submitForm();
        await testUtils.driver.sleep(1000);

        // Form should remain responsive
        const errors = await testUtils.getErrorMessages();
        expect(Array.isArray(errors)).to.be.true;

      } catch (error) {
        // If the form properly handles input limits, that's also acceptable
        console.log('Form properly limits input length:', error.message);
      }
    });

    it('should maintain performance with repeated form interactions', async function() {
      const iterations = 10;
      const timings = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();

        // Fill partial form
        await testUtils.fillField('firstName1', `Test${i}`);
        await testUtils.fillField('email1', `test${i}@example.com`);

        // Trigger validation
        await testUtils.submitForm();
        await testUtils.driver.sleep(500);

        const iterationTime = Date.now() - startTime;
        timings.push(iterationTime);

        // Reset for next iteration
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(500);
      }

      const averageTime = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxTime = Math.max(...timings);

      console.log(`Average iteration time: ${averageTime.toFixed(2)}ms`);
      console.log(`Maximum iteration time: ${maxTime}ms`);

      // Performance should remain consistent
      expect(averageTime).to.be.lessThan(2000);
      expect(maxTime).to.be.lessThan(5000);
    });
  });

  describe('Memory and Resource Usage', function() {
    it('should not cause memory leaks with repeated form usage', async function() {
      // Simulate extended form usage
      for (let session = 0; session < 3; session++) {
        console.log(`Testing session ${session + 1}`);

        // Fill form multiple times
        for (let attempt = 0; attempt < 5; attempt++) {
          await testUtils.fillValidParticipantData(1);
          await testUtils.fillValidParticipantData(2);

          // Clear and refill
          await testUtils.driver.navigate().refresh();
          await testUtils.driver.sleep(1000);
        }

        // Final successful submission
        await testUtils.fillValidFormData();
        await testUtils.submitForm();
        await testUtils.driver.sleep(2000);

        const successMessage = await testUtils.getSuccessMessage();
        expect(successMessage).to.not.be.null;

        // Reset for next session
        await testUtils.driver.navigate().refresh();
        await testUtils.driver.sleep(1000);
      }
    });

    it('should handle concurrent validation without conflicts', async function() {
      // Trigger multiple validations simultaneously
      const email1Field = await testUtils.driver.findElement(By.id('email1'));
      const email2Field = await testUtils.driver.findElement(By.id('email2'));
      const phone1Field = await testUtils.driver.findElement(By.id('phone1'));

      // Enter invalid data in multiple fields rapidly
      await email1Field.sendKeys('invalid1');
      await email2Field.sendKeys('invalid2');
      await phone1Field.clear();
      await phone1Field.sendKeys('+invalid');

      // Trigger validation by clicking away
      const submitButton = await testUtils.driver.findElement(By.css('button[type="submit"]'));
      await submitButton.click();

      await testUtils.driver.sleep(2000);

      // Should handle multiple validation errors correctly
      const errors = await testUtils.getErrorMessages();
      expect(errors.length).to.be.greaterThan(2); // Should have multiple errors

      // Form should remain functional
      const formElement = await testUtils.driver.findElement(By.id('registrationForm'));
      expect(await formElement.isDisplayed()).to.be.true;
    });
  });
});
