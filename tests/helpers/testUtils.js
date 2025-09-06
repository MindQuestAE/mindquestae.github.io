const { Builder, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class TestUtils {
  constructor() {
    this.driver = null;
    this.baseUrl = 'http://localhost:8000';
  }

  async setupDriver() {
    const options = new chrome.Options();

    // Run in headless mode if environment variable is set
    if (process.env.HEADLESS === 'true' || process.env.CI === 'true') {
      options.addArguments('--headless=new');
    }

    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-infobars');
    options.addArguments('--disable-browser-side-navigation');
    options.addArguments('--disable-features=VizDisplayCompositor');
    options.addArguments('--disable-software-rasterizer');

    // Use selenium-manager for automatic driver management
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    await this.driver.manage().setTimeouts({ implicit: 10000 });
    return this.driver;
  }

  async tearDown() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  async navigateToForm() {
    await this.driver.get(this.baseUrl);

    // Wait for page to load
    await this.driver.wait(until.elementLocated(By.id('registrationForm')), 10000);

    // Dismiss cookie consent if present
    await this.dismissCookieBanner();
  }

  async dismissCookieBanner() {
    try {
      const cookieBanner = await this.driver.findElement(By.id('cookieConsent'));
      if (await cookieBanner.isDisplayed()) {
        // Find the accept button within the cookie banner
        const acceptButton = await this.driver.findElement(By.xpath('//button[contains(text(), "Accept")]'));
        await acceptButton.click();
        await this.driver.sleep(500);
      }
    } catch (e) {
      // Cookie banner might not be present or already dismissed
    }
  }

  async fillField(fieldId, value) {
    const field = await this.driver.findElement(By.id(fieldId));
    await field.clear();
    await field.sendKeys(value);
    return field;
  }

  async selectDropdown(selectId, optionValue) {
    const select = await this.driver.findElement(By.id(selectId));
    await select.click();

    const option = await this.driver.findElement(
      By.xpath(`//select[@id='${selectId}']/option[@value='${optionValue}']`)
    );
    await option.click();
  }

  async checkCheckbox(checkboxId) {
    const checkbox = await this.driver.findElement(By.id(checkboxId));
    const isChecked = await checkbox.isSelected();
    if (!isChecked) {
      await checkbox.click();
    }
  }

  async submitForm() {
    const submitButton = await this.driver.findElement(
      By.css('button[type="submit"]')
    );
    await submitButton.click();
  }

  async waitForElement(locator, timeout = 10000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async waitForElementVisible(locator, timeout = 10000) {
    const element = await this.waitForElement(locator, timeout);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  async getErrorMessages() {
    try {
      // Check for form-level errors
      const formErrors = await this.driver.findElements(By.id('form-errors'));
      const fieldErrors = await this.driver.findElements(By.css('.field-error'));

      const errors = [];

      for (let errorElement of formErrors) {
        const text = await errorElement.getText();
        if (text.trim()) {
          errors.push({ type: 'form', message: text });
        }
      }

      for (let errorElement of fieldErrors) {
        const text = await errorElement.getText();
        if (text.trim()) {
          errors.push({ type: 'field', message: text });
        }
      }

      return errors;
    } catch (e) {
      return [];
    }
  }

  async getSuccessMessage() {
    try {
      const successElements = await this.driver.findElements(
        By.css('[style*="background: #4CAF50"], [style*="background:#4CAF50"]')
      );

      for (let element of successElements) {
        const text = await element.getText();
        if (text.includes('Registration Successful') || text.includes('Registration Submitted')) {
          return text;
        }
      }

      return null;
    } catch (e) {
      return null;
    }
  }

  async fillValidParticipantData(participantNumber) {
    const suffix = participantNumber.toString();

    await this.fillField(`firstName${suffix}`, `TestFirstName${suffix}`);
    await this.fillField(`lastName${suffix}`, `TestLastName${suffix}`);
    await this.fillField(`email${suffix}`, `test${suffix}@example.com`);
    await this.fillField(`dob${suffix}`, '2008-05-15');
    await this.fillField(`phone${suffix}`, '+971501234567');
    await this.fillField(`emiratesId${suffix}`, '784200812345678');
    await this.fillField(`school${suffix}`, 'GEMS Wellington International School');
    await this.selectDropdown(`curriculum${suffix}`, 'British');
    await this.selectDropdown(`grade${suffix}`, '10');
  }

  async fillValidFormData() {
    await this.fillValidParticipantData(1);
    await this.fillValidParticipantData(2);
    await this.checkCheckbox('consent');
  }

  // Test data generators
  static getValidTestData() {
    return {
      participant1: {
        firstName: 'Ahmed',
        lastName: 'Al-Rashid',
        email: 'ahmed.rashid@example.com',
        dob: '2008-03-15',
        phone: '+971501234567',
        emiratesId: '784200812345678',
        school: 'GEMS Wellington International School',
        curriculum: 'British',
        grade: '10'
      },
      participant2: {
        firstName: 'Fatima',
        lastName: 'Al-Zahra',
        email: 'fatima.zahra@example.com',
        dob: '2009-07-20',
        phone: '+971507654321',
        emiratesId: '784200912345679',
        school: 'GEMS Dubai American Academy',
        curriculum: 'American',
        grade: '9'
      }
    };
  }

  static getInvalidTestData() {
    return {
      invalidEmails: [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
        'test@.com'
      ],
      invalidPhones: [
        '+971123',
        '971501234567',
        '+97150123456789',
        '+1234567890',
        'invalid-phone'
      ],
      invalidEmiratesIds: [
        '12345',
        '784200812345678901',
        'abcd1234567890e',
        '784-200-812-345-678'
      ],
      invalidDates: [
        '2005-01-01', // Too early
        '2015-12-31', // Too late
        '2008-13-01', // Invalid month
        '2008-02-30', // Invalid date
        'invalid-date'
      ]
    };
  }

  async takeScreenshot(filename) {
    try {
      const screenshot = await this.driver.takeScreenshot();
      const fs = require('fs');
      const path = require('path');

      const screenshotsDir = path.join(__dirname, '..', 'screenshots');
      if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
      }

      const filepath = path.join(screenshotsDir, `${filename}.png`);
      fs.writeFileSync(filepath, screenshot, 'base64');
      console.log(`Screenshot saved: ${filepath}`);
    } catch (e) {
      console.error('Failed to take screenshot:', e.message);
    }
  }
}

module.exports = TestUtils;
