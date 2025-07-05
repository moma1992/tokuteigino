# E2E Testing with Playwright

This document describes the End-to-End (E2E) testing setup for the TOKUTEI Learning frontend application.

## Overview

We use [Playwright](https://playwright.dev/) for E2E testing to ensure the complete user workflows function correctly across different browsers and devices.

## Test Structure

```
frontend/
├── e2e/
│   ├── auth/
│   │   ├── email-confirmation.spec.ts  # Email confirmation flow tests
│   │   └── login-logout.spec.ts        # Login/logout functionality tests
│   ├── ui/
│   │   └── navigation.spec.ts          # UI and navigation tests
│   ├── helpers/
│   │   └── auth-helpers.ts             # Reusable test helper functions
│   └── docker.config.ts               # Docker-specific configuration
├── playwright.config.ts               # Main Playwright configuration
└── test-results/                      # Test output and reports
```

## Test Categories

### 1. Authentication Tests (`e2e/auth/`)

#### Email Confirmation Flow
- User registration with email confirmation
- Redirect to email confirmation pending page
- Form validation (email format, password strength, etc.)
- Role selection (student/teacher)
- Duplicate email handling

#### Login/Logout Flow
- Login with valid/invalid credentials
- Email confirmation requirement enforcement
- Session persistence
- Route protection
- Logout functionality

### 2. UI/UX Tests (`e2e/ui/`)

#### Navigation and Accessibility
- Page loading and title verification
- Responsive design testing
- Keyboard navigation
- ARIA labels and roles
- Loading states and error handling
- Mobile viewport testing

## Running Tests

### Local Development

```bash
# Install Playwright browsers (first time only)
npm run test:e2e:install

# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# View test report
npm run test:e2e:report
```

### Docker Environment

```bash
# Run E2E tests in Docker containers
make test-e2e

# Run with UI mode
make test-e2e-ui

# Run in debug mode
make test-e2e-debug

# Run in headed mode
make test-e2e-headed
```

## Configuration

### Main Configuration (`playwright.config.ts`)
- Browser configurations (Chrome, Firefox, Safari)
- Mobile device testing
- Base URL and timeouts
- Screenshot and video recording
- Test reporting

### Docker Configuration (`e2e/docker.config.ts`)
- Docker-specific settings
- Sequential test execution
- Extended timeouts for container environment

## Test Helpers

### AuthHelpers Class (`e2e/helpers/auth-helpers.ts`)

Provides reusable methods for authentication testing:

```typescript
const authHelpers = new AuthHelpers(page);

// Generate unique test user
const testUser = authHelpers.generateTestUser();

// Navigate to pages
await authHelpers.goToSignup();
await authHelpers.goToLogin();

// Fill forms
await authHelpers.fillSignupForm(testUser);
await authHelpers.fillLoginForm(email, password);

// Submit forms and verify results
await authHelpers.submitSignupForm();
await authHelpers.expectLoggedIn(userName);
await authHelpers.expectLoggedOut();

// Logout
await authHelpers.logout();
```

## Test Data Management

### User Generation
- Unique test users generated with timestamps
- Automatic cleanup between tests
- Configurable user roles (student/teacher)

### Database State
- Tests assume clean database state
- Test users are isolated by unique emails
- Cleanup handled automatically

## CI/CD Integration

### GitHub Actions
E2E tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests
- Manual workflow dispatch

Two test jobs:
1. **Standard**: Direct Node.js environment
2. **Docker**: Full Docker container environment

### Test Artifacts
- Test reports (HTML, JUnit, JSON)
- Screenshots on failure
- Videos on failure
- 30-day retention for reports, 7-day for screenshots

## Best Practices

### Writing Tests
1. **Use Page Object Model**: Encapsulate page interactions in helper classes
2. **Wait for Elements**: Use `waitFor` methods instead of `setTimeout`
3. **Unique Test Data**: Generate unique emails/names for each test
4. **Cleanup**: Ensure tests don't affect each other
5. **Descriptive Names**: Test names should clearly describe the scenario

### Selectors
1. **Prefer Semantic Selectors**: Use text content, labels, roles
2. **Avoid CSS Classes**: Don't rely on implementation details
3. **Use Test IDs**: Add `data-testid` for complex interactions
4. **Accessibility Focus**: Use ARIA labels and roles

### Error Handling
1. **Screenshot on Failure**: Automatic screenshot capture
2. **Video Recording**: Record failures for debugging
3. **Retry Logic**: Configure retries for flaky tests
4. **Timeout Management**: Appropriate timeouts for different actions

## Debugging

### Local Debugging
```bash
# Run specific test file
npx playwright test e2e/auth/login-logout.spec.ts

# Run with debugging
npx playwright test --debug

# Run in headed mode
npx playwright test --headed

# Generate test
npx playwright codegen http://localhost:5173
```

### Docker Debugging
```bash
# Access container for debugging
docker-compose exec frontend sh

# Check logs
docker-compose logs frontend

# Run tests manually in container
docker-compose exec frontend npx playwright test --headed
```

## Troubleshooting

### Common Issues

1. **Tests Timeout**
   - Increase timeout in config
   - Check if services are running
   - Verify network connectivity

2. **Element Not Found**
   - Check if element exists with correct selector
   - Wait for element to be visible
   - Verify page has loaded completely

3. **Docker Issues**
   - Ensure containers are healthy
   - Check port forwarding
   - Verify environment variables

4. **Browser Issues**
   - Reinstall browsers: `npx playwright install`
   - Check browser compatibility
   - Update Playwright version

### Getting Help

1. Check Playwright documentation: https://playwright.dev/
2. Review test output and screenshots
3. Use debug mode to step through tests
4. Check GitHub Actions logs for CI failures

## Future Enhancements

1. **Visual Regression Testing**: Add screenshot comparison
2. **Performance Testing**: Measure page load times
3. **Cross-Browser Matrix**: Expand browser coverage
4. **Mobile Testing**: Add more mobile device configurations
5. **API Testing**: Add backend API integration tests