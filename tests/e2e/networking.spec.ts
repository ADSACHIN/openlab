import { expect, test } from '@playwright/test';

test.describe('networking domain', () => {
  test('catalogue shows Networking as available and lists lessons in order', async ({ page }) => {
    await page.goto('./#/domains/networking');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Networking');
    await expect(page.getByText('Available')).toBeVisible();
    const lessons = page.getByRole('list', { name: 'Networking lessons' }).getByRole('link');
    await expect(lessons).toHaveCount(6);
    await expect(lessons.first()).toContainText('The layers: OSI and TCP/IP');
    await expect(page.getByRole('list', { name: 'Networking labs' }).getByRole('link')).toHaveCount(
      2,
    );
  });

  test('lesson: step a simulator, answer the quiz, mark complete, see it on the domain page', async ({
    page,
  }) => {
    await page.goto('./#/domains/networking/lessons/osi-model');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('OSI and TCP/IP');

    // Layer explorer: select a layer, then step
    await page
      .getByRole('radiogroup', { name: 'OSI layers' })
      .getByRole('radio', { name: /Transport/ })
      .click();
    await expect(page.getByRole('status', { name: 'Simulation status' })).toContainText(
      'Layer 4, Transport',
    );
    await page.getByRole('button', { name: 'Step' }).click();
    await expect(page.getByRole('status', { name: 'Simulation status' })).toContainText(
      'Layer 3, Network',
    );

    // Quiz (scoped: the layer explorer also mentions these words)
    const quiz = page.getByRole('region', { name: 'Check your understanding' });
    await quiz.getByRole('radio', { name: 'Network (3)' }).click();
    await quiz.getByRole('radio', { name: 'Packet' }).click();
    await quiz.getByRole('radio', { name: '7, 6 and 5' }).click();
    await quiz.getByRole('button', { name: 'Check answers' }).click();
    await expect(page.getByText('You got 3 of 3 correct.')).toBeVisible();

    await page.getByRole('button', { name: 'Mark as complete' }).click();
    await expect(page.getByRole('button', { name: /Completed/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByRole('link', { name: 'Networking' }).first().click();
    await expect(page.getByText('1 / 6 done')).toBeVisible();
  });

  test('lab: tighten the subnet until the check passes', async ({ page }) => {
    await page.goto('./#/domains/networking/labs/size-a-subnet');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Size a subnet for 50 hosts');
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/wastes addresses/)).toBeVisible();

    const slider = page.getByRole('slider');
    await slider.focus();
    await slider.press('ArrowRight');
    await slider.press('ArrowRight');
    await expect(page.getByText('/26', { exact: false }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText(/tightest fit/)).toBeVisible();
    await expect(page.getByText('Passed.')).toBeVisible();
  });

  test('lab: hand-driven TCP handshake', async ({ page }) => {
    await page.goto('./#/domains/networking/labs/complete-the-handshake');
    await page.getByRole('button', { name: 'Client: send SYN' }).click();
    await page.getByRole('button', { name: 'Server: send SYN-ACK' }).click();
    await page.getByRole('button', { name: 'Client: send ACK' }).click();
    await page.getByRole('button', { name: 'Client: send data' }).click();
    await page.getByRole('button', { name: 'Check my work' }).click();
    await expect(page.getByText('Perfect: SYN, SYN-ACK, ACK, then data.')).toBeVisible();
  });

  test('search finds a networking lesson', async ({ page }) => {
    await page.goto('./#/search');
    await page.getByRole('searchbox').fill('tls');
    await expect(
      page.getByRole('link', { name: 'TLS 1.3: securing the connection' }),
    ).toBeVisible();
  });
});
