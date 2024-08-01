'use client'
import { useState, useEffect } from "react";
import { firestore, auth } from '@/firebase';
import { Box, Modal, Typography, Stack, TextField, Button, MenuItem, Select } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Home() {
    const [inventory, setInventory] = useState([]);
    const [open, setOpen] = useState(false);
    const [updateOpen, setUpdateOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [itemName, setItemName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [newQuantity, setNewQuantity] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState(null);

    // Google Auth Provider
    const provider = new GoogleAuthProvider();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const updateInventory = async () => {
        if (user) {
            const snapshot = query(collection(firestore, 'users', user.uid, 'inventory'));
            const docs = await getDocs(snapshot);
            const inventoryList = [];
            docs.forEach((doc) => {
                inventoryList.push({
                    name: doc.id,
                    ...doc.data(),
                });
            });
            setInventory(inventoryList);
        }
    };

    const addItem = async (item) => {
        if (user) {
            const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const { quantity } = docSnap.data();
                await setDoc(docRef, { quantity: quantity + 1 });
            } else {
                await setDoc(docRef, { quantity: 1 });
            }
            await updateInventory();
        }
    };

    const removeItem = async (item) => {
        if (user) {
            const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const { quantity } = docSnap.data();
                if (quantity === 1) {
                    await deleteDoc(docRef);
                } else {
                    await setDoc(docRef, { quantity: quantity - 1 });
                }
            }
            await updateInventory();
        }
    };

    const updateItem = async (item, quantity) => {
        if (user) {
            const docRef = doc(collection(firestore, 'users', user.uid, 'inventory'), item);
            await setDoc(docRef, { quantity: quantity });
            await updateInventory();
        }
    };

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Signed in:", user);
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Error signing in: ", error.message);
        }
    };

    const handleSignup = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Signed up:", user);
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("Error signing up: ", error.message);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out: ", error.message);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log("Google Sign-In successful");
            console.log("User:", user);
            console.log("Token:", token);
        } catch (error) {
            console.error("Error signing in with Google: ", error.message);
        }
    };

    useEffect(() => {
        if (user) {
            updateInventory();
        }
    }, [user]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleUpdateOpen = () => setUpdateOpen(true);
    const handleUpdateClose = () => setUpdateOpen(false);

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap={2}
        >
            {user ? (
                <>
                    <Button variant="contained" onClick={handleLogout}>
                        Logout
                    </Button>
                    {/* Inventory management UI */}
                    <Modal open={open} onClose={handleClose}>
                        <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            width={400}
                            bgcolor="white"
                            border="2px solid #000"
                            boxShadow={24}
                            p={4}
                            display="flex"
                            flexDirection="column"
                            gap={3}
                            sx={{
                                transform: "translate(-50%,-50%)"
                            }}
                        >
                            <Typography variant="h6">Add Item</Typography>
                            <Stack width="100%" direction="row" spacing={2}>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    value={itemName}
                                    onChange={(e) => setItemName(e.target.value)}
                                />
                                <Button variant="outlined" onClick={() => {
                                    addItem(itemName);
                                    setItemName('');
                                    handleClose();
                                }}>
                                    Add
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                    <Modal open={updateOpen} onClose={handleUpdateClose}>
                        <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            width={400}
                            bgcolor="white"
                            border="2px solid #000"
                            boxShadow={24}
                            p={4}
                            display="flex"
                            flexDirection="column"
                            gap={3}
                            sx={{
                                transform: "translate(-50%,-50%)"
                            }}
                        >
                            <Typography variant="h6">Update Item</Typography>
                            <Stack width="100%" direction="column" spacing={2}>
                                <Select
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    displayEmpty
                                    fullWidth
                                >
                                    <MenuItem value="" disabled>Select an item</MenuItem>
                                    {inventory.map(item => (
                                        <MenuItem key={item.name} value={item.name}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</MenuItem>
                                    ))}
                                </Select>
                                <TextField
                                    variant="outlined"
                                    fullWidth
                                    placeholder="New Quantity"
                                    value={newQuantity}
                                    onChange={(e) => setNewQuantity(e.target.value)}
                                />
                                <Button variant="outlined" onClick={() => {
                                    updateItem(selectedItem, parseInt(newQuantity));
                                    setSelectedItem('');
                                    setNewQuantity('');
                                    handleUpdateClose();
                                }}>
                                    Update
                                </Button>
                            </Stack>
                        </Box>
                    </Modal>
                    <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={handleOpen}>
                            Add New Item
                        </Button>
                        <Button variant="contained" onClick={() => setSearchOpen(!searchOpen)}>
                            Search for Items
                        </Button>
                        <Button variant="contained" onClick={handleUpdateOpen}>
                            Update Item
                        </Button>
                    </Stack>
                    {searchOpen && (
                        <Box
                            width="100%"
                            maxWidth="800px"
                            padding={2}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            borderRadius={1}
                            bgcolor="#ADD8E6"
                            marginBottom={2}
                        >
                            <TextField
                                variant="outlined"
                                fullWidth
                                placeholder="Search for items"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ bgcolor: 'white' }}
                            />
                        </Box>
                    )}
                    <Box border='1px solid #333' width="100%" maxWidth="800px">
                        <Box
                            width="100%"
                            height="100px"
                            bgcolor="#ADD8E6"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Typography variant='h2' color='#333'>
                                Inventory Items
                            </Typography>
                        </Box>
                        <Stack width="100%" height="300px" spacing={2} overflow="auto">
                            {
                                filteredInventory.map(({ name, quantity }) => (
                                    <Box
                                        key={name}
                                        width="100%"
                                        minHeight="150px"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        bgcolor='#f0f0f0'
                                        padding={5}
                                    >
                                        <Typography variant='h3' color="#333" textAlign="center">
                                            {name.charAt(0).toUpperCase() + name.slice(1)}
                                        </Typography>
                                        <Typography variant='h3' color="#333" textAlign="center">
                                            {quantity}
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Button variant="contained" onClick={() => addItem(name)}>
                                                Add
                                            </Button>
                                            <Button variant="contained" onClick={() => removeItem(name)}>
                                                Remove
                                            </Button>
                                        </Stack>
                                    </Box>
                                ))}
                        </Stack>
                    </Box>
                </>
            ) : (
                <Box
                    width="100vw"
                    height="100vh"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    gap={2}
                >
                    <Typography variant="h6">Login</Typography>
                    <TextField
                        label="Email"
                        variant="outlined"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button variant="contained" onClick={handleLogin}>
                        Login
                    </Button>
                    <Button variant="contained" onClick={handleSignup}>
                        Signup
                    </Button>
                    <Button variant="contained" onClick={handleGoogleSignIn}>
                        Sign In with Google
                    </Button>
                </Box>
            )}
        </Box>
    );
}

