// Test GraphQL Me query
const testGraphQLMe = async () => {
  const graphqlQuery = `
    query Me {
      me {
        id
        name
        username
        email
        profilePicture
        bio {
          text
        }
        location
        tagline
        dateJoined
        followersCount
        followingsCount
        socialMediaLinks {
          twitter
          linkedin
          github
          website
        }
      }
    }
  `;

  try {
    const response = await fetch('https://gql.hashnode.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Không có Authorization header - test public access
      },
      body: JSON.stringify({
        query: graphqlQuery,
      }),
    });

    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('GraphQL Errors:', result.errors);
    }

    if (result.data?.me) {
      console.log('Me data:', result.data.me);
    } else {
      console.log('No me data - authentication required');
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

testGraphQLMe();
