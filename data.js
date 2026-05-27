window.PawPalSeed = {
  user: {
    id: "u-alya",
    name: "Alya Rahman",
    role: "Campus volunteer",
    rating: 4.8,
    avatar: "assets/user_1.png",
    badges: ["Verified rescuer", "Trusted donor", "Fast responder", "Safe meetup"]
  },
  cases: [
    {
      id: "case-snoky",
      type: "rescue",
      title: "Small dog found near campus rail",
      petName: "Snoky",
      species: "Dog",
      urgency: "Critical",
      status: "Open",
      distance: "1.2 km",
      location: "Campus rail",
      owner: "Tan Shelter",
      time: "8 min ago",
      trusted: 82,
      pledged: 90,
      goal: 300,
      image: "assets/pet_6_1.png",
      tags: ["urgent", "verified", "transport", "medical"],
      description: "Needs transport, one-night foster help, and medical support tonight.",
      tasks: ["task-transport", "task-foster", "task-photo"],
      comments: [
        { id: "c-1", author: "Tan Shelter", text: "I can bring a carrier. Need someone with a car by 7 PM.", time: "6m" },
        { id: "c-2", author: "Mei Lin", text: "Verified location. Dog is scared but not aggressive.", time: "4m" },
        { id: "c-3", author: "Campus Vet Club", text: "Please upload a clearer injury photo before moving him.", time: "2m" }
      ],
      trust: [
        ["Shelter account verified", "Tan Shelter has 4.9 community rating.", "Pass"],
        ["Location protected", "Exact pickup point hidden until task confirmation.", "On"],
        ["Photo evidence requested", "Clear injury photo required before donation release.", "Pending"]
      ]
    },
    {
      id: "case-rabbit",
      type: "rescue",
      title: "Rabbit missing near hostel garden",
      petName: "Mochi",
      species: "Rabbit",
      urgency: "High",
      status: "Open",
      distance: "700 m",
      location: "Hostel garden",
      owner: "Campus Pet Club",
      time: "22 min ago",
      trusted: 74,
      pledged: 35,
      goal: 120,
      image: "assets/pet_2_1.png",
      tags: ["urgent", "search", "campus"],
      description: "Owner needs nearby students to check garden corners before evening rain.",
      tasks: ["task-rabbit-search", "task-rabbit-poster"],
      comments: [
        { id: "c-4", author: "Izzat", text: "I checked the parking side. Not there.", time: "12m" }
      ],
      trust: [
        ["Owner identity checked", "Student email confirmed.", "Pass"],
        ["Public location only", "Exact dorm block is hidden.", "On"]
      ]
    },
    {
      id: "case-food",
      type: "donation",
      title: "Food support for rescued kittens",
      petName: "Kitties",
      species: "Cat",
      urgency: "Medium",
      status: "Open",
      distance: "2.4 km",
      location: "Taman Ria",
      owner: "Mei Lin",
      time: "1h ago",
      trusted: 91,
      pledged: 160,
      goal: 240,
      image: "assets/pet_5_1.png",
      tags: ["donation", "food", "verified"],
      description: "Two bags of kitten food needed before weekend. Receipt will be uploaded.",
      tasks: ["task-receipt"],
      comments: [
        { id: "c-5", author: "Mei Lin", text: "I will post receipt after buying the food.", time: "32m" }
      ],
      trust: [
        ["Receipt required", "Donation proof must be uploaded.", "On"],
        ["Known rescuer", "Mei Lin has closed 7 cases.", "Pass"]
      ]
    }
  ],
  pets: [
    {
      id: "pet-kitties",
      name: "Kitties",
      species: "Cat",
      age: "3 months",
      gender: "Mixed",
      distance: "2.4 km",
      owner: "Mei Lin",
      status: "Screening",
      match: 91,
      image: "assets/pet_5_1.png",
      description: "Four healthy kittens. Owner prefers adopters with stable home plans.",
      traits: ["Indoor friendly", "Vaccination planned", "Sibling group"]
    },
    {
      id: "pet-luna",
      name: "Luna",
      species: "Cat",
      age: "1 year",
      gender: "Female",
      distance: "4.8 km",
      owner: "KL Foster Home",
      status: "Available",
      match: 84,
      image: "assets/pet_4_1.png",
      description: "Calm adult cat looking for a quiet home.",
      traits: ["Calm", "Litter trained", "Good with students"]
    },
    {
      id: "pet-milo",
      name: "Milo",
      species: "Cat",
      age: "8 months",
      gender: "Male",
      distance: "5.1 km",
      owner: "Tan Shelter",
      status: "Available",
      match: 78,
      image: "assets/pet_4_2.png",
      description: "Playful kitten, best for adopters with pet experience.",
      traits: ["Playful", "Vaccinated", "Needs active home"]
    }
  ],
  tasks: [
    { id: "task-transport", caseId: "case-snoky", title: "Transport to vet", detail: "Pickup near campus rail before 8 PM.", type: "transport", status: "open", distance: "1.2 km", due: "Tonight" },
    { id: "task-foster", caseId: "case-snoky", title: "One-night foster", detail: "Quiet room preferred until shelter opens tomorrow.", type: "foster", status: "open", distance: "1.8 km", due: "Tonight" },
    { id: "task-photo", caseId: "case-snoky", title: "Post status photo", detail: "Upload clear injury photo after vet check.", type: "update", status: "open", distance: "1.2 km", due: "After vet" },
    { id: "task-rabbit-search", caseId: "case-rabbit", title: "Search garden area", detail: "Check hedges and parking side with owner.", type: "search", status: "open", distance: "700 m", due: "Before rain" },
    { id: "task-rabbit-poster", caseId: "case-rabbit", title: "Print missing poster", detail: "Put posters at hostel notice boards.", type: "post", status: "open", distance: "900 m", due: "Today" },
    { id: "task-receipt", caseId: "case-food", title: "Verify food receipt", detail: "Check receipt and mark donation proof as verified.", type: "verify", status: "claimed", distance: "2.4 km", due: "Weekend" }
  ],
  notifications: [
    { id: "n-1", title: "Receipt uploaded", text: "Medical proof is ready for community review.", time: "18m", read: false, target: "case-food" },
    { id: "n-2", title: "Case verified", text: "Two trusted users confirmed Snoky's location.", time: "3h", read: false, target: "case-snoky" },
    { id: "n-3", title: "Adoption review", text: "Kitties owner is checking adopter profiles.", time: "1d", read: true, target: "pet-kitties" }
  ],
  donations: [
    { id: "d-1", caseId: "case-snoky", amount: 50, type: "Medical", status: "Pledged", from: "Alya" },
    { id: "d-2", caseId: "case-food", amount: 80, type: "Food", status: "Receipt pending", from: "Community" }
  ],
  applications: []
};
