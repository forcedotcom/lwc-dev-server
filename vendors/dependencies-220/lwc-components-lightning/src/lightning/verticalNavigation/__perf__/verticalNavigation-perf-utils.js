/**
 * Generate m sections with n items (item, badge, icon) each.
 * @param {Integer} m number of sections
 * @param {Integer} n number of items in each section.
 * @returns {Array} List of sections.
 */
export function generateSections(m, n) {
    const results = [];
    for (let i = 0; i < m; i++) {
        results.push({
            label: `Section ${i}`,
            children: generateLeafChildren(n),
        });
    }
    return results;
}

/**
 * Generates m overflows with n items each.
 * @param {Integer} m number of overflows.
 * @param {Integer} n number of items in each overflow.
 * @returns {Array} List of overflows.
 */
export function generateOverflows(m, n) {
    const results = [];
    for (let i = 0; i < m; i++) {
        results.push({
            label: `Overflow ${i}`,
            children: generateLeafChildren(n),
        });
    }
    return results;
}

const childTypes = ['item', 'badge', 'icon'];

/**
 * Generates n items cycling through defined child types (item, badge and icon).
 * @param {Integer} n number of items.
 * @returns {Array} list of items.
 */
function generateLeafChildren(n) {
    const results = [];
    for (let i = 0; i < n; i++) {
        const type = childTypes[i % childTypes.length];
        const leafChild = {
            name: `item${i}`,
            label: `Item ${i}`,
            href: 'www.salesforce.com',
        };
        leafChild[type] = true;
        leafChild.badgeCount = type === 'badge' ? 2 : undefined;
        leafChild.iconName = type === 'icon' ? 'utility:user' : undefined;
        results.push(leafChild);
    }
    return results;
}
