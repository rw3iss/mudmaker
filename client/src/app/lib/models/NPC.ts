import { EntityBase } from './EntityBase';

export class NPC extends EntityBase {

    public shortDescription: string;

    public longDescription: string;

    public aliases: Array<string>;
    
    public objects: Array<Object>;

}