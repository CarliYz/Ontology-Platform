export interface Property {
  id: string;
  objectTypeId: string;
  apiName: string;
  displayName: string;
  type: string;
  required: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObjectType {
  id: string;
  ontologyId: string;
  apiName: string;
  displayName: string;
  description?: string;
  status: string;
  primaryKey?: string;
  createdAt: string;
  updatedAt: string;
  properties: Property[];
}

export interface LinkType {
  id: string;
  ontologyId: string;
  apiName: string;
  displayName: string;
  fromObject: string;
  toObject: string;
  cardinality: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ontology {
  id: string;
  name: string;
  description?: string;
  status: string;
  latestPublishedVersion?: string;
  createdAt: string;
  updatedAt: string;
  objectTypes: ObjectType[];
  linkTypes: LinkType[];
}
