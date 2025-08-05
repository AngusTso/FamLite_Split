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
  Alert,
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
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import ProgressBar from "react-native-progress/Bar";

export default function ShareTaskBoard({ navigation, route }) {
  const { groupId, groupName } = route.params || {
    groupId: "67ebed2ae60b708a02ff57a2",
    groupName: "",
  };
  const { token, user } = useAuth();
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
  const { t } = useTranslation();

  console.log(groupName);
  const completedTasks = tasklist.filter(
    (task) => task.isCompleted === true
  ).length;
  const totalTasks = tasklist.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksResult = await fetch(
          `http://192.168.50.68:3000/tasks?groupId=${groupId}`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
        );
        const tasksData = await tasksResult.json();
        setTasklist(tasksData);

        const membersRes = await fetch(
          `http://192.168.50.68:3000/groups/${groupId}/members`,
          {
            headers: {
              authorization: `Bearer ${token}`,
            },
          }
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

      socket.on("taskDeleted", ({ taskId }) => {
        if (tasklist.some((task) => task._id === taskId)) {
          setTasklist((prev) => prev.filter((task) => task._id !== taskId));
        }
      });

      socket.emit("joinGroup", groupId);
    }

    return () => {
      if (socket) {
        socket.emit("exitGroup", groupId);
        socket.off("taskCreated");
        socket.off("taskUpdated");
        socket.off("taskDeleted");
      }
    };
  }, [socket, groupId, tasklist]);

  const createTask = async () => {
    if (taskName === "") {
      alert("Please enter TaskName");
      return;
    }
    try {
      console.log(taskName);
      const res = await fetch("http://192.168.50.68:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          taskName: taskName,
          description: description || "",
          dueDate: dueDate ? dueDate.toISOString() : null,
          groupId: groupId,
          createdBy: user._id,
          assignedTo: assignedTo || null,
        }),
      });
      if (!res.ok) throw new Error("Task creation Failed ");
      setTaskName("");
      setDescription("");
      setDueDate(null);
      setAssignedTo("");
      setModalVisible(false);
      Alert.alert("Success", "Task Created");
      return;
    } catch (e) {
      console.error(e);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasklist((prev) =>
      prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
  };

  const handleShuffleTasks = debounce(async () => {
    try {
      const res = await fetch("http://192.168.50.68:3000/tasks/shuffle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) throw new Error("Shuffle failed");
      const updatedTask = await res.json();
      setTasklist(updatedTask);
      Alert.alert("Success", "Tasks Shuffled");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Shuffle failed !! Try again later");
    }
  }, 3000);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        keyboardVerticalOffset={Platform.OS === "ios" ? hp("0") : hp("0%")}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={wp("5%")} color="#000" />
          </TouchableOpacity>

          {/*<TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>{t("logout")}</Text>
          </TouchableOpacity>*/}

          <View style={styles.controls}>
            <View style={styles.toggleViewMode}>
              <Text style={styles.viewMode}>
                {overviewMode ? t("overview") : t("Your_view")}
              </Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setOverviewMode((prev) => !prev)}
              >
                <Icon name="arrow-right" size={wp("5%")} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.shuffleButton}
              onPress={handleShuffleTasks}
            >
              <Icon name="random" size={wp("5%")} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {groupName + " " + t("completed_tasks")}: {completedTasks}/
            {totalTasks}
          </Text>
          <ProgressBar
            progress={progress}
            width={wp("90%")}
            height={hp("1%")}
            color="#5865f2"
            unfilledColor="#e0e0e0"
            borderWidth={0}
          />
        </View>

        <View style={styles.taskBoard}></View>
        <FlatList
          style={styles.tasklist}
          data={
            overviewMode
              ? tasklist
              : tasklist.filter((task) => task.assignedTo === user._id)
          }
          renderItem={({ item }) => (
            <TaskBlock
              task={item}
              members={members}
              groupId={groupId}
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
            placeholder={t("enter_task")}
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
                  placeholder={t("task_name")}
                />
                <TextInput
                  style={styles.modalInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t("description")}
                  multiline
                />
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateButtonText}>
                    {dueDate ? dueDate.toLocaleString() : t("select_deadline")}
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
                    <Text style={styles.modalButtonText}>{t("cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={createTask}
                  >
                    <Text style={styles.modalButtonText}>
                      {t("create_task")}
                    </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: wp("5%"),
    margibHorizontal: wp("5%"),
    marginTop: hp("2%"),
    marginBottom: hp("1%"),
    height: hp("8%"), // Fixed height
  },
  headerText: {
    fontSize: wp("5%"),
    fontWeight: "bold",
    color: "#333",
    lineHeight: hp("6%"), // Align text vertically
    textAlignVertical: "center",
  },

  backButton: {
    padding: wp("2%"),
    borderRadius: 5,
    marginLeft: wp("1%"),
    marginRight: wp("15%"),
    height: hp("6%"), // Match viewMode height
    justifyContent: "center",
    alignItems: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: wp("5%"),
    marginBottom: hp("2%"),
    height: hp("8%"), // Match header height
  },
  toggleViewMode: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  viewMode: {
    padding: wp("2%"),
    borderWidth: 2,
    minWidth: wp("25%"),
    textAlign: "center",
    fontSize: wp("4%"),
  },
  toggleButton: {
    backgroundColor: "black",
    padding: wp("2%"),
    borderRadius: 5,
    marginLeft: wp("2%"),
    height: hp("6%"), // Match viewMode height
    justifyContent: "center",
    alignItems: "center",
  },
  shuffleButton: {
    flexDirection: "row",
    backgroundColor: "#5865f2",
    padding: wp("2%"),
    borderRadius: 5,
    alignItems: "center",
    height: hp("6%"), // Match viewMode height
    justifyContent: "center",
  },
  shuffleButtonText: {
    color: "#fff",
    fontSize: wp("4%"),
    marginLeft: wp("2%"),
  },
  progressContainer: {
    width: "90%",
    marginVertical: hp("2%"),
    alignItems: "center",
  },
  progressText: {
    fontSize: wp("4%"),
    marginBottom: hp("1%"),
    color: "#333",
  },
  progressBar: {
    width: "100%",
    height: hp("1%"),
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
