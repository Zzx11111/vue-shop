<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom',index1 === 0 ? 'bdtop' : '','vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限和三级权限 -->
              <el-col :span="19">
                <!-- for循环渲染二级权限 -->
                <el-row
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                  :class="[index2 === 0 ? '' : 'bdtop','vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRolesVisible" width="30%">
      <!-- 主体 -->
      <el-form ref="rolesformRef" :model="rolesform" label-width="80px" :rules="rolesRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesform.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesform.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRolesVisible" width="30%">
      <!-- 主体 -->
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="rolesRules">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="eidtRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
      <!-- 树形控件-->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"
      ref="treeRef"></el-tree>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //添加角色的展示或隐藏
      addRolesVisible: false,
      //添加角色表单
      rolesform: {},
      //表单校验规则
      rolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ]
      },
      //修改角色的展示和隐藏
      editRolesVisible: false,
      editForm: {},
      //分配权限的展示和隐藏
      setRightDialogVisible: false,
      //所有权限的数据
      rightsList:[],
      //树形控件的属性绑定对象
      treeProps:{
        label:'authName',
        children:'children'
      },
      //默认选中的节点ID值
      defKeys:[],
      //当前即将分配权限的角色ID
      roleId:''
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取角色列表
    getRolesList() {
      this.$http.get("roles").then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取角色列表失败！");
        }
        this.rolelist = res.data.data;
        console.log(this.rolelist);
      });
    },
    //添加角色
    addRoles() {
      this.$refs.rolesformRef.validate(valid => {
        if (!valid) return;
        this.$http.post("roles", this.rolesform).then(res => {
          console.log(res);
          if (res.data.meta.status !== 201)
            return this.$message.error("添加角色失败！");
          this.$message.success("添加用户成功");
          this.getRolesList();
          this.addRolesVisible = false;
        });
      });
    },
    //展示修改角色的数据
    showEditDialog(id) {
      this.$http.get("roles/" + id).then(res => {
        if (res.data.meta.status !== 200)
          return this.$message.error("获取角色信息失败！");
        this.editForm = res.data.data;
        console.log(this.editForm);
        this.editRolesVisible = true;
      });
    },
    //修改角色
    eidtRoles() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return;
        this.$http
          .put("roles/" + this.editForm.roleId, {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          })
          .then(res => {
            console.log(res);
            if (res.data.meta.status !== 200)
              return this.$message.error("修改角色信息失败！");
            this.$message.success("修改用户成功");
            this.getRolesList();
            this.editRolesVisible = false;
          });
      });
    },
    //删除角色
    removeRoles(id) {
      this.$confirm("此操作将永久删除角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$http.delete("roles/" + id).then(res => {
            if (res.data.meta.status !== 200) return this.$message("删除失败");
            this.$message.success("删除成功");
            this.getRolesList();
          });
        })
        .catch(() => {
          this.$message.error("已取消删除！");
        });
    },
    //根据ID删除对应的权限
    removeRightById(role, rightId) {
      this.$confirm("此操作将永久删除角色, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(res => {
          this.$http
            .delete("roles/" + role.id + "/rights/" + rightId)
            .then(res => {
              console.log(res);
              if (res.data.meta.status !== 200)
                return this.$message.error("删除权限失败！");
              role.children = res.data.data;
              this.$message.success("删除权限成功！");
            });
        })
        .catch(() => {
          this.$message.error("已取消删除！");
        });
    },
    //展示分配权限的对话框
    showSetRightDialog(role) {
      this.roleId = role.id
      //获取所有权限的数据
      this.$http.get('rights/tree').then(res => {
        console.log(res)
        if(res.status !== 200) return  this.$message.error("获取所有权限数据失败！");
        this.rightsList = res.data.data;
      })
      
      //通过for循环的形式，获取角色三级权限的ID
      /* for(let i =0;i<role.children.length;i++){
        for(let j =0;j<role.children[i].children.length;j++){
          for(let k =0;k<role.children[i].children[j].children.length;k++){
            this.defKeys.push(role.children[i].children[j].children[k].id);
          }
        }
      } */
      //递归
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true;
    },
    //通过递归的形式，获取角色三级权限的ID
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id);
      }
      node.children.forEach(item => this.getLeafKeys(item,arr))
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed(){
      this.defKeys = []
    },
    //为角色分配权限
    allotRights(){
      const key = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = key.join(',')
      this.$http.post('roles/'+this.roleId+'/rights',{
        rids:idStr
      }).then(res => {
        if(res.data.meta.status !== 200) return this.$message.error('更新权限失败!')
        this.$message.success('分配权限成功！')
        this.getRolesList()
        this.setRightDialogVisible = false
      })
    }

  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>