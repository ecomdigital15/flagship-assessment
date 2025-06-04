require('dotenv').config();
const fetch = require('node-fetch');

const SHOP_NAME = process.env.SHOP_NAME;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const PRODUCT_ID = process.env.PRODUCT_ID;

const SHOPIFY_ADMIN_URL = `https://${SHOP_NAME}.myshopify.com/admin/api/2025-04/graphql.json`;

// Query to get the existing metafield
const GET_METAFIELD_QUERY = `
  query getMetafield($productId: ID!) {
    product(id: $productId) {
      metafield(namespace: "global", key: "test") {
        id
        value
      }
    }
  }
`;

// Mutation to create a new metafield
const CREATE_METAFIELD_MUTATION = `
  mutation createMetafield($input: MetafieldsSetInput!) {
    metafieldsSet(metafields: [$input]) {
      metafields {
        id
        value
      }
      userErrors {
        field
        message
      }
    }
  }
`;

async function makeGraphQLRequest(query, variables) {
  try {
    const response = await fetch(SHOPIFY_ADMIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': ACCESS_TOKEN
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    return await response.json();
  } catch (error) {
    console.error('Error making GraphQL request:', error);
    throw error;
  }
}

async function updateMetafield() {
  try {
    // First, get the existing metafield
    const getMetafieldResponse = await makeGraphQLRequest(GET_METAFIELD_QUERY, {
      productId: `gid://shopify/Product/${PRODUCT_ID}`
    });

    console.log(getMetafieldResponse);

    const existingMetafield = getMetafieldResponse.data.product.metafield;
    const newValue = existingMetafield ? parseInt(existingMetafield.value) + 1 : 0;

    // Create or update the metafield
    const updateResponse = await makeGraphQLRequest(CREATE_METAFIELD_MUTATION, {
      input: {
        ownerId: `gid://shopify/Product/${PRODUCT_ID}`,
        namespace: "global",
        key: "test",
        type: "single_line_text_field",
        value: newValue.toString()
      }
    });

    if (updateResponse.errors?.length > 0) {
      console.error('Error updating metafield:', createResponse.errors);
      return;
    }

    console.log(`Metafield ${existingMetafield ? 'updated' : 'created'} successfully. New value: ${newValue}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the update function
updateMetafield();

