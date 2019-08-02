export const icons = [
    'utility:add',
    'utility:automate',
    'utility:company',
    'utility:event',
    'utility:new',
    'standard:account',
    'standard:entity',
    'standard:case',
    'action:filter',
    'action:user',
];

export const actions = [
    'change_owner',
    'change_record_type',
    'check',
    'clone',
    'close',
    'defer',
    'delete',
    'description',
    'dial_in',
    'download',
    'edit',
    'edit_groups',
    'edit_relationship',
    'email',
    'fallback',
    'filter',
    'flow',
    'follow',
    'following',
    'freeze_user',
    'goal',
    'google_news',
    'info',
    'join_group',
    'lead_convert',
    'leave_group',
    'log_a_call',
    'log_event',
    'manage_perm_sets',
    'map',
    'more',
    'new',
    'new_account',
    'new_campaign',
    'new_case',
    'new_child_case',
    'new_contact',
    'new_event',
    'new_group',
    'new_lead',
    'new_note',
    'new_notebook',
    'new_opportunity',
    'new_person_account',
    'new_task',
    'password_unlock',
    'preview',
    'priority',
    'question_post_action',
    'quote',
    'recall',
    'record',
    'refresh',
    'reject',
    'remove',
    'remove_relationship',
    'reset_password',
    'script',
    'share',
    'share_file',
    'share_link',
    'share_poll',
    'share_post',
    'share_thanks',
    'sort',
    'submit_for_approval',
    'update',
    'update_status',
    'upload',
    'user',
    'user_activation',
    'view_relationship',
    'web_link',
];

let nextId = 1;

export function getItems(num) {
    const items = [];

    const iconsLength = icons.length;
    for (let i = 0; i < num; i++) {
        const id = nextId++;
        const item = {
            id: `menu${id}`,
            label: `${actions[id % actions.length]}`,
            value: `${actions[id % actions.length]}`,
            iconName: `${icons[id % iconsLength]}`,
            prefixIconName: `${icons[iconsLength - 1 - id % iconsLength]}`,
        };
        if (id % 5) {
            item.isDraft = true;
        }
        if (id % 6) {
            item.href = 'http://www.example.com';
        }
        if (id % 7) {
            item.checked = true;
        }
        items.push(item);
    }

    return items;
}
