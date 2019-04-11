class LocalDevServerContainer {
    public name: string;

    /**
     * Create an instance of a Container class.
     * A container is a previewer type. It influences what
     * services and look/feel you get when previewing your components.
     */
    constructor(name: string) {
        this.name = name;
    }

    /**
     * Wrapper for the specified container to use when previewing.
     */
    public writeToResponse(response) {
        console.log(response);
    }
}

/*
const main = `import * as Engine from 'lwc';
import main from '${namespace}-${mainModule}';

const element = Engine.createElement('${namespace}-${mainModule}', { is: main });
const container = document.getElementById('localdevservercontainer') || document.body
container.appendChild(element);
`;
return main;
*/

export default LocalDevServerContainer;
