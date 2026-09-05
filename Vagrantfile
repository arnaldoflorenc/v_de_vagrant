Vagrant.configure("2") do |config|
  is_arm = RUBY_PLATFORM.include?("arm64") || RUBY_PLATFORM.include?("aarch64")
  box_name = is_arm ? "bento/ubuntu-22.04" : "ubuntu/focal64"

  config.vm.boot_timeout = 600

  config.vm.provider "virtualbox" do |vb|
    vb.gui = false
    vb.memory = "2048"
    vb.cpus = 1
    
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--nested-hw-virt", "off"]
  end

  config.vm.define "frontend" do |frontend|
    frontend.vm.box = box_name
    frontend.vm.box_architecture = "arm64" if is_arm
    frontend.vm.hostname = "frontend"

    frontend.vm.network "forwarded_port", guest: 5173, host: 5173, auto_correct: true
    frontend.vm.network "private_network", ip: "10.1.1.10", virtualbox__intnet: "front_back"

    # frontend.vm.synced_folder "../shared/frontend", "/home/vagrant/frontend", type: "virtualbox"

    frontend.vm.provision "shell", inline: <<-SHELL
      set -e
      
      sudo apt-get update
      sudo apt-get install -y curl net-tools git

      git clone --branch rios --no-checkout https://github.com/arnaldoflorenc/v_de_vagrant.git /home/vagrant/work  #! Alterar branch dps para a master (remover --branch dev)
      cd /home/vagrant/work
      git sparse-checkout set frontend
      git checkout

      export DEBIAN_FRONTEND=noninteractive

      if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs build-essential
      fi

      cd /home/vagrant/work/frontend
      sudo chown -R vagrant:vagrant /home/vagrant/work/frontend
      npm install --no-bin-links

      cat <<'EOF' | sudo tee /etc/systemd/system/frontend.service
[Unit]
Description=React Frontend
After=network.target

[Service]
User=vagrant
WorkingDirectory=/home/vagrant/work/frontend
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm run dev -- --host 0.0.0.0
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

      sudo systemctl daemon-reload
      sudo systemctl enable frontend
      sudo systemctl restart frontend
    SHELL
  end

  config.vm.define "backend" do |backend|
    backend.vm.box = box_name
    backend.vm.box_architecture = "arm64" if is_arm
    backend.vm.hostname = "backend"

    backend.vm.network "forwarded_port", guest: 3000, host: 3000, auto_correct: true
    backend.vm.network "private_network", ip: "10.1.1.2", virtualbox__intnet: "front_back"
    backend.vm.network "private_network", ip: "10.1.2.10", virtualbox__intnet: "back_db"

    # backend.vm.synced_folder "../shared/backend", "/home/vagrant/backend", type: "virtualbox"

    backend.vm.provision "shell", inline: <<-SHELL
      set -e

      sudo apt-get update
      sudo apt-get install -y curl net-tools git

      git clone --branch rios --no-checkout https://github.com/arnaldoflorenc/v_de_vagrant.git /home/vagrant/work  #! Alterar branch dps para a master (remover --branch dev)
      cd /home/vagrant/work
      git sparse-checkout set backend
      git checkout
      
      export DEBIAN_FRONTEND=noninteractive

      if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs build-essential
      fi

      cd /home/vagrant/work/backend
      sudo chown -R vagrant:vagrant /home/vagrant/work/backend
      npm install --no-bin-links

      cat <<'EOF' | sudo tee /etc/systemd/system/backend.service
[Unit]
Description=Node.js Backend
After=network.target

[Service]
User=vagrant
WorkingDirectory=/home/vagrant/work/backend
Environment=PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
Environment=NODE_ENV=development
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF

      sudo systemctl daemon-reload
      sudo systemctl enable backend
      sudo systemctl restart backend
    SHELL
  end

  config.vm.define "db" do |db|
    db.vm.box = box_name
    db.vm.box_architecture = "arm64" if is_arm
    db.vm.hostname = "db"

    db.vm.network "private_network", ip: "10.1.2.2", virtualbox__intnet: "back_db"
    # db.vm.synced_folder "../shared/db", "/home/vagrant/db"

    db.vm.provision "shell", inline: <<-SHELL
      set -e

      sudo apt-get update
      sudo apt-get install -y curl net-tools git

      git clone --branch rios --no-checkout https://github.com/arnaldoflorenc/v_de_vagrant.git /home/vagrant/work  #! Alterar branch dps para a master (remover --branch dev)
      cd /home/vagrant/work
      git sparse-checkout set db
      git checkout
      
      export DEBIAN_FRONTEND=noninteractive

      if ! command -v mysql &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y mysql-server
      fi

      sudo systemctl enable mysql
      sudo systemctl start mysql

      sudo sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mysql.conf.d/mysqld.cnf
      sudo systemctl restart mysql

      if [ -f /home/vagrant/work/db/schema.sql ]; then
        sudo mysql < /home/vagrant/work/db/schema.sql
      fi
    SHELL
  end
end