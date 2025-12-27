
import { Dog, ChatPreview } from './types';

export const MOCK_DOGS: Dog[] = [
    {
        id: '1',
        name: 'Thor',
        age: 2,
        breed: 'Golden Retriever',
        distance: '2 km',
        location: 'Copacabana',
        match: 98,
        bio: 'Adoro correr no parque e nadar! 🎾 I love running at the park and swimming!',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIgw68kCAjAjep3K-dc6QYoTA5p_yaGH5-JJRPXgjMgKLsFHuO-ISxCU2MG83064lLyCiffcngvSpmizGsaQtUNDsW2-I0D2DClUkfiMbvBLn-mlMat8-1xinadvDwQmlPPqpgC2q5xmcxxHs23rsW3y5z-31_0Nm_iOJEb8NkGrmnX_iNH9kqjyUB25FSxuMCHJ913e2HdBRZvwNb0VDTrMXn4YCD8riPdIelMVCmRtJgeIA3cgDRY07Zhpf7-n9jHFbK4dta3-AJ',
        traits: ['Vaccinated', 'Neutered', 'High Energy'],
        is_castrated: true
    },
    {
        id: '2',
        name: 'Rex',
        age: 4,
        breed: 'Golden Retriever',
        distance: '2 km',
        location: 'Ipanema',
        match: 95,
        bio: "Olá! I'm a super energetic Golden who loves long walks on the beach.",
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw74xqbgAl2rKhAn1gJXd98vS696SypOti2sG5rD6leUTfTRMdI8wbvZcQoY2q3NAqtW5UiD-ok7DaPyqAFVuS6CnZGUqxhFnyxVuvsjzT66WttV7HlwOedKKwunea5tMvBtZIjuAqCItrdoyG5MAQG0o_7J1XsRZDEySXPem9QYAiX9UoQS1Jnx6agb8uAxhe58AD6AgQQhPl6C8agUX-IBRax6NZBoLfk9aQ8ANUwx0MaCsP2k2NZp-bV3h8CUUc5rodBkybQOrF',
        traits: ['Vaccinated', 'Loves Beach', 'Social']
    },
    {
        id: '3',
        name: 'Max',
        age: 1,
        breed: 'French Bulldog',
        distance: '1.5 km',
        location: 'Botafogo',
        match: 87,
        bio: 'Small but full of personality. I love belly rubs!',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB303FhK5TXzuaKiUYh2fVCuDReCvRHov6YEz-TbfdekV2okEHBaxn5ogCUdwG_2XXc-xPEz8673DOIqx1zsDzEfSP4Sz-W2AVihqQm874y-sqivH01hFpRviBy3qWf6vBczCETeDws9eFpAXDwbgRLkYRFCHG__YYSxupRQVEQ-9D0MtDK6aSnqOac_5Z5BO56YTqp-johPHlDkw2IPCVk2LsiWZkhSLCviZUbgMvTh0F7JsqYNGKn7Lql9EzgKRio5lVkyHJQmLZu',
        traits: ['Puppy', 'Vaccinated', 'Chill']
    }
];

export const MOCK_CHATS: ChatPreview[] = [
    {
        id: 'c1',
        name: 'Buddy & Clara',
        role: 'Dog Owner',
        lastMessage: 'Oi! Adoraríamos encontrar o Rex no parque!',
        time: '10:42 AM',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsY1wwIri-tq0-KT1fTsfJVzSBCFob6qZSqfB81lPkGipP3Y_rrcJesptixHNCUbakE7NNqkKa3zC0Jv77CmqwH-tYsqt_zJcOUwXscrAkG_V-ELj-Y6W9tUx9z5klcPAuO6thEpJBHIC6GUbXw48S_3K3E3BeuEhTDnmQbQXhCR27ZETcoT2zgeTnLLAV-ZQIqNdyWDLRaAFQGdrXJ8wIdtOr8D0TyOuLewwXFt6SgQaLnAuZKV18Hrt8jkqNM214DlnccU3pppFc',
        unreadCount: 2,
        online: true
    },
    {
        id: 'c2',
        name: 'Marina',
        role: 'Dog Walker',
        lastMessage: 'Perfect! I\'m available Saturday afternoon.',
        time: '09:15 AM',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0waTkSiFsbNrhmqVa9IcdmVprpkq6yJfg9_7a2VCgwa0_eBXOiKkvuTRpVSyiGfwUXP2qlsE4UpxWKXgoG42tIEemr9xVRkFsReD8UfqKDhus_E2sBZolayqGBhSBjuAe2BIkQKiNPLKUPWE2WCSUEs64u-fMB793qf5LFlkcKDHOaqPPy0bh80L6nCv4UvItVqxC3ZGtYMXKl7-deVF9-QYEc3E7Fx_wkapqG5ld1v8ESgeLzRyQHaiVvw4ltiF8vjdscDWwMlFm',
        unreadCount: 1,
        online: true
    }
];
