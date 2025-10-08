import { getCollection } from './mongodb';

const CONTACT_FORMS_COLLECTION = 'contactForms';

async function getContactFormsCollection() {
  return getCollection(CONTACT_FORMS_COLLECTION);
}

export async function saveContactForm(data) {
  const collection = await getContactFormsCollection();
  const doc = { ...data, createdAt: new Date() };
  const result = await collection.insertOne(doc);
  return result.insertedId;
}

export async function getAllContactForms() {
  const collection = await getContactFormsCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
} 
