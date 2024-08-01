'use client'
import { useState, useEffect } from "react";
import { firestore } from '@/firebase'
import { Box, Modal, Typography, Stack, TextField, Button, MenuItem, Select } from "@mui/material";
import { collection, deleteDoc, doc, getDocs, query, getDoc, setDoc } from 'firebase/firestore'

export default function Home() {
    const [inventory, setInventory] = useState([])
    const [open, setOpen] = useState(false)
    const [updateOpen, setUpdateOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false) // Added state for searchOpen
    const [itemName, setItemName] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedItem, setSelectedItem] = useState('')
    const [newQuantity, setNewQuantity] = useState('')

    const updateInventory = async () => {
        const snapshot = query(collection(firestore, 'inventory'))
        const docs = await getDocs(snapshot)
        const inventoryList = []
        docs.forEach((doc) => {
            inventoryList.push({
                name: doc.id,
                ...doc.data(),
            })
        })
        setInventory(inventoryList)
    }

    const addItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            await setDoc(docRef, { quantity: quantity + 1 })
        } else {
            await setDoc(docRef, { quantity: 1 })
        }
        await updateInventory()
    }

    const removeItem = async (item) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const { quantity } = docSnap.data()
            if (quantity === 1) {
                await deleteDoc(docRef)
            } else {
                await setDoc(docRef, { quantity: quantity - 1 })
            }
        }
        await updateInventory()
    }

    const updateItem = async (item, quantity) => {
        const docRef = doc(collection(firestore, 'inventory'), item)
        await setDoc(docRef, { quantity: quantity })
        await updateInventory()
    }

    useEffect(() => {
        updateInventory()
    }, [])

    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    const handleUpdateOpen = () => setUpdateOpen(true)
    const handleUpdateClose = () => setUpdateOpen(false)

    const filteredInventory = inventory.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                            onChange={(e) => {
                                setItemName(e.target.value)
                            }}
                        />
                        <Button variant="outlined" onClick={() => {
                            addItem(itemName)
                            setItemName('')
                            handleClose()
                        }}
                        >
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
                            updateItem(selectedItem, parseInt(newQuantity))
                            setSelectedItem('')
                            setNewQuantity('')
                            handleUpdateClose()
                        }}
                        >
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
                                    <Button variant="contained" onClick={() => {
                                        addItem(name)
                                    }}
                                    >
                                        Add
                                    </Button>
                                    <Button variant="contained" onClick={() => {
                                        removeItem(name)
                                    }}
                                    >
                                        Remove
                                    </Button>
                                </Stack>
                            </Box>
                        ))}
                </Stack>
            </Box>
        </Box>
    )
}

