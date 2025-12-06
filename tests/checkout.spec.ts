import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase client for direct DB verification (Service Role not needed for public tables usually, but strict RLS might block)
// We will use standard anon key for verification of public data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

test.describe('Colmado App Backend Tests', () => {

  test('Database Seed Verification', async () => {
    // Verify Global Products exist (from seed_products.sql)
    const { data: products, error: pError } = await supabase
      .from('global_products')
      .select('name')
      .ilike('name', '%Presidente%');

    expect(pError).toBeNull();
    expect(products?.length).toBeGreaterThan(0);
    expect(products?.[0].name).toContain('Presidente');

    // Verify Colmados exist (from seed.sql)
    const { data: colmados, error: cError } = await supabase
      .from('colmados')
      .select('name');

    expect(cError).toBeNull();
    expect(colmados?.some(c => c.name.includes('Bendición'))).toBeTruthy();
  });

  test('Fiado Transaction Success', async ({ page }) => {
    // 1. Login as Pedro (Customer)
    await page.goto('/login');
    await page.fill('#email', 'pedro@cliente.com');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    await page.waitForText('Success', { selector: '#login-message' });

    // 2. Navigate to test harness
    await page.goto('/test-harness');

    // 3. Click Success Button
    // Navigate to test harness
    await page.goto('/test-harness');

    // Click Success Button
    await page.click('#btn-fiado-success');

    // Wait for result
    await page.waitForSelector('#success-indicator');

    // Verify text
    const resultText = await page.textContent('#result-area');
    expect(resultText).toContain('true');
    expect(resultText).toContain('pending'); // Order status
  });

  test('Fiado Transaction Failure (Limit Exceeded)', async ({ page }) => {
    // 1. Login as Pedro (Customer)
    await page.goto('/login');
    await page.fill('#email', 'pedro@cliente.com');
    await page.fill('#password', 'password123');
    await page.click('#login-btn');
    await page.waitForText('Success', { selector: '#login-message' });

    // 2. Navigate to test harness
    await page.goto('/test-harness');

    // 3. Click Fail Button
    // Navigate to test harness
    await page.goto('/test-harness');

    // Click Fail Button
    await page.click('#btn-fiado-fail');

    // Wait for result
    await page.waitForSelector('#error-indicator');

    // Verify error message
    const errorText = await page.textContent('#error-indicator');
    expect(errorText).toContain('Credit limit exceeded');
  });

});
