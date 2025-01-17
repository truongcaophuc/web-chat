import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
} from "@mui/material";
import Avatar from "react-avatar";
const AddMemberDialog = ({ open, handleClose, members, onAdd,users }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  console.log(selectedMembers);
  const handleToggle = (memberId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(memberId)
        ? prevSelected.filter((id) => id !== memberId)
        : [...prevSelected, memberId]
    );
  };

  const handleAdd = () => {
    const newMembers = selectedMembers.filter(
        (memberId) => !members?.some((member) => member._id === memberId)
      );
    onAdd(newMembers);
    setSelectedMembers([]);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Thêm thành viên</DialogTitle>
      <DialogContent>
        <List>
          {users.map((user) => (
            <ListItem key={user._id}>
              <ListItemAvatar>
              <Avatar
                name={user.firstName+" "+user.lastName}
                size={40}
                round={true}
              />
              </ListItemAvatar>
              <ListItemText primary={user.firstName+" "+user.lastName} />
              <Checkbox
                edge="end"
                disabled={members?.some((member) => member._id === user._id)} 
                checked={
                    Boolean(selectedMembers.includes(user._id)) || // Luôn chuyển `checked` thành true/false
                    members?.some((member) => member._id === user._id) // Luôn tích nếu đã là thành viên
                  }
                onChange={() => handleToggle(user._id)}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button variant="contained" onClick={handleAdd}>
          Thêm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddMemberDialog;
