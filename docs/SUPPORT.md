# CCI Nice Menu support

You can ask for help at any point. The checks below are optional and may help
you narrow down a problem.

## Choose the right support channel

We are happy to help if a step is unclear or something is not working as expected. You can describe the situation in your own words.

For a usage question or a problem you can describe publicly, [open a GitHub issue](https://github.com/cool-cat-ideas/cci-nice-menu/issues/new). Sign in to GitHub, add a short title and describe what you tried and what happened. Questions are welcome; you do not need to confirm a bug first. You can read and reply to our messages in the same issue.

For a private question, order or licence issue, use [Services and support](https://coolcatideas.com/en/account/services/) in your Cool Cat Ideas account:

1. Sign in, or create an account if you do not have one.
2. Under **Contact the team**, choose **General question**. If your licence includes active technical support, you can instead choose **Technical support for a licence** and select the relevant **Licence**.
3. Enter a subject and describe the issue. A screenshot and the installed product version can help. Please leave out passwords, licence keys and customer data.
4. Click **Send message**. Your conversation opens after submission, and you can return to it under **Your conversations** on the same page.

You can send a general question without an active support licence. For an installation or technical intervention you already purchased, open the item under **Purchased services** and use its linked conversation.

For an unclear documentation step or a broken link, use **Report an issue** on the [online documentation page](https://coolcatideas.com/en/docs/cci-nice-menu/1.0.0/support/). It opens the documentation feedback form. To report a security vulnerability, please [email info@coolcatideas.com](mailto:info@coolcatideas.com) rather than posting the details publicly.

Never include passwords, license keys, access tokens, customer data or production database exports in a public post.

## License checks

For Pro, confirm:

- `cci_nice_menu_pro` is installed and enabled,
- the license key was activated for the current shop domain,
- the shop can reach the license API,
- the displayed shop domain matches the domain you want to activate.

If activation fails, send the displayed error and shop domain through the
private account form above. Please leave out the licence key.

## Production domain checklist

Domain setup is handled by PrestaShop and hosting, not by the menu module.

Check:

1. DNS points to the production server.
2. PrestaShop shop URL and SSL URL match the final domain.
3. SSL is enabled.
4. Cache is cleared after changing the domain.
5. Internal menu URLs are relative or were regenerated for the final domain.
6. External links open the intended target.

## Theme compatibility checklist

For a missing menu, these checks may help. Ask your site administrator if you
are unsure how to perform them:

- confirm that the selected hook exists in the active theme,
- check if the theme overrides the module template,
- disable CSS/JS optimization temporarily,
- clear PrestaShop cache,
- test with the standard `displayTop` position.

## Information to include

Start with what you tried and what happened. Include any of these details you
know; you do not need to collect them all before asking:

- PrestaShop version,
- PHP version,
- module version,
- Free or Pro edition,
- active theme name,
- selected hook position,
- screenshot of the menu configuration,
- storefront URL where the issue is visible,
- browser console errors, if any,
- list of installed modules that also change navigation.

For CSS issues, include both desktop and mobile screenshots.
