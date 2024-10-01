import { useState } from "react";

function Header() {
  return (
    <header className="header">
      <h1>Bill Splitz</h1>
    </header>
  );
}

// Initial list of friends with their IDs, names, images, and balance information.
const initialFriends = [
  {
    id: 118836,
    name: "James",
    image: "https://i.pravatar.cc/48?img=8",
    balance: -10, // Negative value means you owe your friend
  },
  {
    id: 933372,
    name: "Sarah",
    image: "https://i.pravatar.cc/48?u=933372",
    balance: 10, // Positive value means your friend owes you
  },
  {
    id: 499476,
    name: "Anthony",
    image: "https://i.pravatar.cc/48?u=499476",
    balance: 0, // Neutral/0 means that you and your friend are both even
  },
];

// Button component that renders a button with customizable content and an onClick handler
function Button({ children, onClick }) {
  return (
    <button className="button" onClick={onClick}>
      {children}
    </button>
  );
}

// Main App component
export default function App() {
  // State to manage friends list, visibility of the add friend form, and selected friend
  const [friends, setFriends] = useState(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  // Toggle the visibility of the add friend form
  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  // Add a new friend to the friends list and close the add friend form
  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
    setShowAddFriend(false);
  }

  // Handle the selection of a friend for splitting a bill
  function handleSelection(friend) {
    setSelectedFriend((cur) => (cur?.id === friend.id ? null : friend));
    setShowAddFriend(false); // Close the add friend form if a friend is selected
  }

  // Split the bill between the user and the selected friend
  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value } // Update the balance of the selected friend
          : friend
      )
    );
    setSelectedFriend(null); // Deselect the friend after splitting the bill
  }

  return (
    <div className="app">
      <Header />
      <div className="sidebar">
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection} // Pass selection handler to FriendsList
        />

        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />} // Show add friend form if state is true

        <Button onClick={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add friend"} // Button text changes based on state
        </Button>
      </div>

      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend} // Pass selected friend to bill splitting form
          onSplitBill={handleSplitBill} // Pass split bill handler
        />
      )}
    </div>
  );
}

// Component to display the list of friends
function FriendsList({ friends, onSelection, selectedFriend }) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          friend={friend}
          key={friend.id} // Unique key for each friend
          selectedFriend={selectedFriend}
          onSelection={onSelection} // Pass selection handler to Friend component
        />
      ))}
    </ul>
  );
}

// Component to display an individual friend
function Friend({ friend, onSelection, selectedFriend }) {
  const isSelected = selectedFriend?.id === friend.id; // Check if the friend is selected

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt="{friend.name}"></img>
      <h3>{friend.name}</h3>

      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} ${Math.abs(friend.balance)} // Display negative balance message
        </p>
      )}

      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you ${Math.abs(friend.balance)} // Display positive balance message
        </p>
      )}

      {friend.balance === 0 && <p>You and {friend.name} are even</p>} // Display even message

      <Button onClick={() => onSelection(friend)}> 
        {isSelected ? "Close" : "Select"} // Button text changes based on selection
      </Button>
    </li>
  );
}

// Component to add a new friend
function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState(""); // State for friend's name
  const [image, setImage] = useState("https://i.pravatar.cc/48"); // State for friend's image

  // Handle form submission to add a new friend
  function handleSubmit(e) {
    e.preventDefault();

    if (!name || !image) return; // Prevent adding friend without name or image

    const id = crypto.randomUUID(); // Generate a unique ID for the new friend
    const newFriend = {
      id,
      name,
      image: `${image}?=${id}`, // Ensure unique image URL
      balance: 0, // Initial balance is zero
    };

    onAddFriend(newFriend); // Call handler to add the friend

    setName(""); // Reset name input
    setImage("https://i.pravatar.cc/48"); // Reset image input
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👥Friend Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)} // Update name state
      />

      <label>📷Image URL</label>
      <input
        type="text"
        value={image}
        onChange={(e) => setImage(e.target.value)} // Update image state
      />

      <Button>Add</Button>
    </form>
  );
}

// Component to split the bill with a selected friend
function FormSplitBill({ selectedFriend, onSplitBill }) {
  const [bill, setBill] = useState(""); // State for total bill amount
  const [paidByUser, setPaidByUser] = useState(""); // State for amount paid by user
  const paidByFriend = bill ? bill - paidByUser : ""; // Calculate amount paid by the friend
  const [whoIsPaying, setWhoIsPaying] = useState("user"); // State to determine who is paying

  // Handle form submission to split the bill
  function handleSubmit(e) {
    e.preventDefault();

    if (!bill || !paidByUser) return; // Prevent submission without necessary values
    onSplitBill(whoIsPaying === "user" ? paidByFriend : -paidByUser); // Call split bill handler with the correct value
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <label>💰Bill value</label>
      <input
        type="text"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))} // Update bill state
      />

      <label>🙋‍♂️Your expense</label>
      <input
        type="text"
        value={paidByUser}
        onChange={(e) =>
          setPaidByUser(
            Number(e.target.value) > bill ? paidByUser : Number(e.target.value) // Ensure user doesn't enter more than bill
          )
        }
      />

      <label>👥{selectedFriend.name}'s expense:</label>
      <input type="text" disabled value={paidByFriend} /> // Display friend's calculated expense

      <label>❓ Who is paying the bill:</label>
      <select
        value={whoIsPaying}
        onChange={(e) => setWhoIsPaying(e.target.value)} // Update payer selection
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>

      <Button>Split Bill</Button>
    </form>
  );
}

