<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px">
          <!-- eslint-disable -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分类角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
          <!-- eslint-enable-->
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogVisibleClose"
    >
      <!-- 内容主体 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="moblie">
          <el-input v-model="addForm.moblie"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <!-- 主体 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="moblie">
          <el-input v-model="editForm.moblie"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <p>当前的用户：{{userInfo.username}}</p>
      <p>当前的角色：{{userInfo.role_name}}</p>
      <p>
        分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  //验证邮箱的规则
  data() {
    var checkEmail = (rule, value, cb) => {
      const reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
      if (reg.test(value)) {
        return cb();
      }
      cb(new Error("邮箱不符合"));
    };
    //验证手机号的规则
    var checkMoblie = (rule, value, cb) => {
      const reg = /^[1][3,4,5,7,8,9][0-9]{9}$/;
      if (reg.test(value)) {
        return cb();
      }
      cb(new Error("手机不符合"));
    };
    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: "",
        //当前页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //控制添加用户对话框
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        moblie: ""
      },
      //添加表单的验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3到10个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码的长度在6到15个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        moblie: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMoblie, trigger: "blur" }
        ]
      },
      //控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      //查询到的用户信息对象
      editForm: {},
      editFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名的长度在3到10个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        moblie: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMoblie, trigger: "blur" }
        ]
      },
      //控制分配角色对话框的显示和隐藏
      setRoleDialogVisible: false,
      //需要被分配角色的用户信息
      userInfo: {},
      //所有角色的数据列表
      rolesList: [],
      //已选中的角色ID值
      selectedRoleId:''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败！");
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开关状态的改变
    userStateChange(userinfo) {
      this.$http
        .put("users/" + userinfo.id + "/state/" + userinfo.mg_state)
        .then(res => {
          if (res.data.meta.status !== 200) {
            userinfo.mg_state = !userinfo.mg_state;
            return this.$message.error("更新用户失败!");
          }
          this.$message.success("更新用户状态成功！");
        });
    },
    searchUser() {
      this.queryInfo.pagenum = 1;
      this.getUserList();
    },
    //添加用户表单重置
    addDialogVisibleClose() {
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮，添加新用户
    addUser() {
      this.$refs.addFormRef.validate(valid => {
        if (valid === false) {
          return;
        }
        this.$http
          .post("users", {
            username: this.addForm.username,
            password: this.addForm.password,
            email: this.addForm.email,
            moblie: this.addForm.moblie
          })
          .then(res => {
            if (res.data.meta.status !== 201)
              return this.$message.error("添加用户失败！");
            this.$message.success("添加用户成功");
          });
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    //展示修改用户的对话框
    showEditDialog(id) {
      this.$http.get("users/" + id).then(res => {
        console.log(res.data);
        if (res.data.meta.status !== 200)
          return this.$message.error("查询用户信息失败！");
        this.editForm = res.data.data;
      });
      this.editDialogVisible = true;
    },
    //监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息提交
    editUserInfo() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .put("users/" + this.editForm.id, {
            email: this.editForm.email,
            moblie: this.editForm.moblie
          })
          .then(res => {
            console.log(res);
            if (res.status !== 200)
              return this.$message.error("更新用户信息失败！");

            this.editDialogVisible = false;
            this.getUserList();
            this.$message.success("更新用户信息成功！");
          });
      });
    },
    //删除用户信息
    removeUserById(id) {
      console.log(id);
      //弹框询问
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(res => {
          this.$http.delete("users/" + id).then(res => {
            if (res.data.meta.status !== 200)
              return this.$message.error("删除失败");
            this.$message.success("删除成功");
            this.getUserList();
          });
        })
        .catch(err => {
          this.$message.error("取消删除");
        });
    },
    //展示分配角色的对话框
    setRole(userInfo) {
      this.userInfo = userInfo;
      //在展示对话框之前获取所有角色列表
      this.$http.get("roles").then(res => {
        if (res.data.meta.status !== 200)
          return this.$message.error("获取角色列表失败！");
        this.rolesList = res.data.data;
      });
      this.setRoleDialogVisible = true;
    },
    //点击按钮分配角色
    saveRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色')
      }
      this.$http.put('users/'+this.userInfo.id+'/role',{
        rid:this.selectedRoleId
      }).then(res => {
        if(res.data.meta.status !== 200) return this.$message.error('分配角色失败！')
        this.$message.success('分配角色成功！')
        this.getUserList()
        this.setRoleDialogVisible = false
      })
    },
    //监听分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId = ''
      this.userInfo = {}
    }
  }
};
</script>

<style lang="less" scoped>
</style>