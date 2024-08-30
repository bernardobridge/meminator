export async function artilleryPlaywrightFunction(page, vuContext, events, test) {
    await page.goto(vuContext.vars.target);
    for (let i = 0; i < 5; i++) {
        await page.getByRole('button', { name: 'GO' }).click();
        await page.getByAltText('Picture').waitFor({ state: 'visible' });
    }
};