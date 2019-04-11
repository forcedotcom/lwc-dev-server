class LocalDevServerDependencyManager {
    /**
     * Get the Filesystem location for a particular dependency.
     *
     * @param dependency The name of the dependency. The key of what you would have put in package.json dependency.
     */
    public getDependencyPath(dependency: string) {
        return '';
    }

    /**
     * Get the version specified for the particular dependency.
     *
     * @param dependency The name of the dependency. The key of what you would have put in package.json dependency.
     */
    public getDependencyVersion(dependency: string) {
        return '';
    }
}

export default LocalDevServerDependencyManager;
