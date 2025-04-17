import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import TaskBlock from "../components/TaskBlock";
import { SocketContext } from "../contexts/SocketContext";
import Icon from "react-native-vector-icons/FontAwesome";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
const userId = "67ebfd10e60b708a02ff57a3";

export default function ShareTaskBoard({ navigation, route }) {
  const { groupId } = route.params || { groupId: "67ebed2ae60b708a02ff57a2" };
  const { token } = useAuth();

  //Task creation related state
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");

  const [overviewMode, setOverviewMode] = useState(true);
  const socket = useContext(SocketContext);
  const [tasklist, setTasklist] = useState([]);
  const [members, setMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResult = await fetch(
          `http://192.168.50.68:3000/tasks?groupId=${groupId}`
        );
        const tasksData = await tasksResult.json();
        setTasklist(tasksData);

        const membersRes = await fetch(
          `http://192.168.50.68:3000/groups/${groupId}/members`
        );
        const membersData = await membersRes.json();
        setMembers(membersData);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [groupId]);

  useEffect(() => {
    if (socket) {
      socket.on("taskCreated", (task) => {
        console.log("Task created:" + task);
        if (task.groupId === groupId) {
          setTasklist((prev) => [...prev, task]);
        }
      });

      socket.on("taskUpdated", (updatedTask) => {
        if (updatedTask.groupId === groupId) {
          setTasklist((prev) =>
            prev.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            )
          );
        }
      });

      socket.emit("joinGroup", groupId);
    }

    return () => {
      if (socket) {
        socket.emit("exitGroup", groupId);
        socket.off("taskCreated");
        socket.off("taskUpdated");
      }
    };
  }, [socket, groupId]);

  const createTask = async () => {
    if (taskName === "") {
      alert("Please enter TaskName");
      return;
    }
    try {
      console.log(taskName);
      const res = await fetch("http://192.168.50.68:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: taskName,
          description: description || "",
          dueDate: dueDate ? dueDate.toISOString() : null,
          groupId: groupId,
          createdBy: userId,
          assignedTo: assignedTo || null,
        }),
      });
      const newTask = await res.json();
      setTaskName("");
      setDescription("");
      setDueDate(null);
      setAssignedTo("");
      setModalVisible(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasklist((prev) =>
      prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={wp("5%")} color="#000" />
          </TouchableOpacity>
          <View style={styles.toggleViewMode}>
            <Text style={styles.viewMode}>
              {overviewMode ? "Overview" : "Member View"}
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setOverviewMode((prev) => !prev)}
            >
              <Icon name="arrow-right" size={wp("5%")} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.taskBoard}>
          <Text style={styles.taskBoardText}>Shared Task Board!</Text>
        </View>
        <FlatList
          style={styles.tasklist}
          data={tasklist}
          renderItem={({ item }) => (
            <TaskBlock
              task={item}
              members={members}
              onUpdate={handleTaskUpdate}
            />
          )}
          keyExtractor={(item) => item._id}
        />
        <View style={styles.taskInput}>
          <TextInput
            style={styles.input}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Enter Task"
          />
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="arrow-up" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.createButton} onPress={createTask}>
            <Icon name="plus" size={20} color="#fff" />
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Task Detail</Text>
                <TextInput
                  style={styles.modalInput}
                  value={taskName}
                  onChangeText={setTaskName}
                  placeholder="Task Name"
                />
                <TextInput
                  style={styles.modalInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Description (optional)"
                  multiline
                />
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {dueDate ? dueDate.toLocaleString() : "Select deadline"}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={dueDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setDueDate(selectedDate);
                    }}
                  />
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={createTask}
                  >
                    <Text style={styles.modalButtonText}>Create Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    flexDirection: "column",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: hp("5%"),
  },
  //header
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: wp("5%"),
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
  },
  backButton: {
    padding: wp("2%"),
    borderRadius: 5,
    marginLeft: wp("1%"),
  },
  toggleViewMode: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: wp("5%"),
    alignItems: "center",
  },
  viewMode: {
    padding: wp("2%"),
    borderWidth: 2,
    minWidth: wp("25%"), // 動態設置最小寬度
    textAlign: "center",
    fontSize: wp("4%"),
    height: hp("6%"),
  },
  toggleButton: {
    backgroundColor: "black",
    padding: wp("2%"),
    borderRadius: 5,
    marginLeft: wp("2%"),
  },

  //Task Board related
  taskBoard: {
    marginVertical: hp("3%"),
  },
  taskBoardText: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  tasklist: {
    flex: 1,
    width: "100%",
    paddingHorizontal: wp("5%"),
  },
  taskInput: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp("5%"),
    paddingVertical: hp("1%"),
    bottom: 0,
    position: "absolute",
  },
  input: {
    borderWidth: 2,
    borderRadius: 20,
    width: wp("70%"),
    height: hp("6%"),
    padding: wp("2%"),
    marginVertical: hp("1%"),
    fontSize: wp("4%"),
    marginRight: wp("2%"),
  },
  arrowButton: {
    backgroundColor: "black",
    width: wp("10%"),
    height: hp("5%"),
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: wp("2%"),
  },
  createButton: {
    backgroundColor: "black",
    width: wp("10%"),
    height: hp("5%"),
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "white",
    fontSize: wp("5%"),
  },

  //modal below
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: wp("80%"),
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: wp("5%"),
    alignItems: "center",
  },
  modalTitle: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 5,
    width: "100%",
    padding: wp("2%"),
    marginBottom: hp("2%"),
    fontSize: wp("4%"),
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 5,
    padding: wp("2%"),
    marginBottom: hp("2%"),
    width: "100%",
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: wp("4%"),
    color: "#000",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#5865f2",
    padding: wp("2%"),
    borderRadius: 5,
    width: wp("30%"),
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
  },
});
