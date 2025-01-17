import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Slide, Stack, Tab, Tabs } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  FetchFriendRequests,
  FetchFriends,
  FetchUsers,
  FetchFriendInvitations,
} from "../../redux/slices/app";
import {
  FriendElement,
  FriendRequestElement,
  UserElement,
} from "../../components/UserElement";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "../../components/Search";
import { ArchiveBox, CircleDashed, MagnifyingGlass } from "phosphor-react";
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});
const UsersList = ({ handleClose,searchText }) => {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.app);
  const filter_users = users.filter((user) => {
    const name = user.firstName + user.lastName;
    return name.toLowerCase().includes(searchText.toLowerCase());
  });
  useEffect(() => {
    dispatch(FetchUsers());
    console.log("đã phát fetch user rôi");
  }, []);

  return (
    <>
      {filter_users.map((el, idx) => {
        return (
          <Stack>
            {" "}
            <UserElement key={idx} {...el} handleClose={handleClose} />
          </Stack>
        );
      })}
    </>
  );
};

const FriendsList = ({ handleClose,searchText }) => {
  const dispatch = useDispatch();

  const { friends } = useSelector((state) => state.app);
  const filter_users = friends.filter((user) => {
    const name = user.firstName + user.lastName;
    return name.toLowerCase().includes(searchText.toLowerCase());
  });
  useEffect(() => {
    dispatch(FetchFriends());
  }, []);

  return (
    <>
      {filter_users.map((el, idx) => {
        return <FriendElement key={idx} {...el} handleClose={handleClose} />;
      })}
    </>
  );
};

const RequestsList = ({searchText}) => {
  const dispatch = useDispatch();
  console.log("chuyển tab");
  const { friendRequests } = useSelector((state) => state.app);
  const filter_users = friendRequests.filter((request) => {
    const name = request.sender.firstName + request.sender.lastName;
    return name.toLowerCase().includes(searchText.toLowerCase());
  });
  useEffect(() => {
    dispatch(FetchFriendRequests());
  }, []);

  return (
    <>
      {filter_users.map((el, idx) => {
        return <FriendRequestElement key={idx} {...el.sender} id={el._id} />;
      })}
    </>
  );
};

const Friends = ({ open, handleClose }) => {
  const [value, setValue] = React.useState(0);
  const dispatch = useDispatch();
  console.log(handleClose);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const [searchText, setSearchText] = useState(""); // State để lưu giá trị tìm kiếm
  const handleSearchChange = (event) => {
    setSearchText(event.target.value); // Cập nhật giá trị khi người dùng nhập
  };
  useEffect(() => {
    dispatch(FetchFriendInvitations());
  }, []);

  return (
    <Dialog
      fullWidth
      maxWidth="xs"
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      
    >
      {/* <DialogTitle>{"Friends"}</DialogTitle> */}
      <Stack p={1} sx={{ width: "100%" }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="Khám phá" />
          <Tab label="Bạn bè" />
          <Tab label="Lời mời kết bạn" />
        </Tabs>
      </Stack>
      <DialogContent>
        <Stack sx={{ minHeight: "200px",height:"300px",gap:"8px" }}>
          {" "}
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm"
              inputProps={{ "aria-label": "search" }}
              value={searchText} // Gắn giá trị tìm kiếm vào input
              onChange={handleSearchChange} // Gọi handleSearchChange khi thay đổi
            />
          </Search>{" "}
          <Stack spacing={2.4}>
            {(() => {
              switch (value) {
                case 0: // display all users in this list
                  return <UsersList handleClose={handleClose} searchText={searchText}/>;

                case 1: // display friends in this list
                  return <FriendsList handleClose={handleClose}  searchText={searchText}/>;

                case 2: // display request in this list
                  return <RequestsList  searchText={searchText}/>;

                default:
                  break;
              }
            })()}
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default Friends;
