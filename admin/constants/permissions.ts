export const PERMISSION_GROUPS = [
    {
        name: 'Products',
        permissions: [
            { key: 'products:view', label: 'View Products' },
            { key: 'products:create', label: 'Create Products' },
            { key: 'products:edit', label: 'Edit Products' },
            { key: 'products:delete', label: 'Delete Products' },
        ],
    },
    {
        name: 'Categories',
        permissions: [
            { key: 'categories:view', label: 'View Categories' },
            { key: 'categories:create', label: 'Create Categories' },
            { key: 'categories:edit', label: 'Edit Categories' },
            { key: 'categories:delete', label: 'Delete Categories' },
        ],
    },
    {
        name: 'Orders',
        permissions: [
            { key: 'orders:view', label: 'View Orders' },
            { key: 'orders:edit', label: 'Edit Orders' },
            { key: 'orders:update_status', label: 'Update Order Status' },
            { key: 'orders:print', label: 'Print Invoices' },
            { key: 'orders:delete', label: 'Delete Orders' },
        ],
    },
    {
        name: 'Users',
        permissions: [
            { key: 'users:view', label: 'View Users' },
            { key: 'users:create', label: 'Create Admins/Staff' },
            { key: 'users:edit', label: 'Edit Users' },
            { key: 'users:delete', label: 'Delete Users' },
            { key: 'users:manage_roles', label: 'Manage User Roles' },
        ],
    },
    {
        name: 'Coupons',
        permissions: [
            { key: 'coupons:view', label: 'View Coupons' },
            { key: 'coupons:create', label: 'Create Coupons' },
            { key: 'coupons:edit', label: 'Edit Coupons' },
            { key: 'coupons:delete', label: 'Delete Coupons' },
        ],
    },
    {
        name: 'Banners',
        permissions: [
            { key: 'banners:view', label: 'View Banners' },
            { key: 'banners:create', label: 'Create Banners' },
            { key: 'banners:edit', label: 'Edit Banners' },
            { key: 'banners:delete', label: 'Delete Banners' },
        ],
    },
    {
        name: 'Roles',
        permissions: [
            { key: 'roles:view', label: 'View Roles' },
            { key: 'roles:create', label: 'Create Roles' },
            { key: 'roles:edit', label: 'Edit Roles' },
            { key: 'roles:delete', label: 'Delete Roles' },
        ],
    },
    {
        name: 'Reports',
        permissions: [
            { key: 'reports:view', label: 'View Reports' },
        ],
    },
];
